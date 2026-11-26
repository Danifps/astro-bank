import crypto from 'node:crypto';
import cors from 'cors';
import mongoose from 'mongoose';
import { BlacklistedAddress } from '../models/BlacklistedAddress.js';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutos máximos de sesión activa
const SESSION_COOKIE_NAME = 'astro_session';
const LOGIN_FAILURE_LIMIT = 5;
const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_DURATION_MS = 60 * 1000;
const ATTACK_STRIKE_LIMIT = 3;
const ATTACK_STRIKE_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_COLLECTION = 'security_rate_limits';
const PERMANENT_BLOCK_REASON = 'Repeated forbidden MongoDB operator or prototype keys';

/**
 * SESSION_SECRET se obtiene de forma lazy para ser compatible con dotenv.
 * En producción falla hard si no está definida; en desarrollo usa fallback temporal.
 */
let _sessionSecret = null;
function getSessionSecret() {
  if (!_sessionSecret) {
    _sessionSecret = process.env.SESSION_SECRET;
    if (!_sessionSecret || _sessionSecret.length < 32) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          '[SEGURIDAD CRÍTICA] SESSION_SECRET no está definida o tiene menos de 32 caracteres. ' +
          'El servidor no puede arrancar en producción sin ella. Defínela en backend/.env'
        );
      }
      console.warn(
        '[SEGURIDAD] ⚠️  SESSION_SECRET no definida o muy corta. ' +
        'Usando clave temporal aleatoria. Las sesiones se invalidarán al reiniciar. ' +
        'Define SESSION_SECRET en backend/.env'
      );
      _sessionSecret = crypto.randomBytes(32).toString('hex');
    }
  }
  return _sessionSecret;
}

/**
 * Valida que la configuración de seguridad esté lista para producción.
 * Llamar al inicio del servidor, después de dotenv.config().
 */
export function validateSecurityConfig() {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new Error(
        '[SEGURIDAD CRÍTICA] SESSION_SECRET no está configurada correctamente. ' +
        'Mínimo 32 caracteres. El servidor se detiene por seguridad.'
      );
    }

    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    const hasInvalidOrigin = allowedOrigins.some((origin) => {
      try {
        const parsedOrigin = new URL(origin);
        return parsedOrigin.protocol !== 'https:' || parsedOrigin.origin !== origin;
      } catch {
        return true;
      }
    });
    if (allowedOrigins.length === 0 || hasInvalidOrigin) {
      throw new Error('[SEGURIDAD CRÍTICA] Configura ALLOWED_ORIGINS con orígenes HTTPS en producción.');
    }
    const trustedProxies = (process.env.TRUST_PROXY || '').trim();
    if (!trustedProxies || ['true', 'false'].includes(trustedProxies.toLowerCase())) {
      throw new Error('[SEGURIDAD CRÍTICA] Configura TRUST_PROXY con las IPs o subredes de los proxies confiables.');
    }
    if (!process.env.MONGODB_URI) {
      throw new Error('[SEGURIDAD CRÍTICA] MONGODB_URI debe configurarse en producción.');
    }
    return;
  }

  if (!secret || secret.length < 32) {
    console.warn('[SEGURIDAD] ⚠️  SESSION_SECRET no configurada. Se usarán sesiones temporales solo para desarrollo.');
  }
}

const SQL_INJECTION_PATTERNS = [
  /(--|\/\*|\*\/)/,
  /(['"`]\s*(or|and)\s+['"`0-9])/i,
  /\b(or|and)\s+1\s*=\s*1\b/i,
  /;\s*(select|insert|update|delete|drop|alter|create|truncate|exec|execute|replace)\b/i,
  /\bunion\s+(all\s+)?select\b/i,
  /\bselect\b[\s\S]+\bfrom\b/i,
  /\binsert\s+into\b/i,
  /\bupdate\s+[a-z0-9_`"[\]]+\s+set\b/i,
  /\bdelete\s+from\b/i,
  /\b(drop|alter|truncate)\s+(table|database|collection|schema|view)\b/i,
  /\b(waitfor\s+delay|benchmark\s*\(|sleep\s*\()/i,
  /<\s*\/?\s*script\b/i
];

function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export { getClientIp };

function hasDangerousCode(value) {
  if (typeof value === 'string') {
    return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
  }

  if (Array.isArray(value)) {
    return value.some(hasDangerousCode);
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
        return true;
      }
      if (hasDangerousCode(nested)) {
        return true;
      }
    }
  }

  return false;
}

function hasForbiddenOperatorKey(value) {
  if (Array.isArray(value)) {
    return value.some(hasForbiddenOperatorKey);
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
        return true;
      }
      if (hasForbiddenOperatorKey(nested)) {
        return true;
      }
    }
  }

  return false;
}

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, nested] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
        continue;
      }
      clean[key] = sanitizeValue(nested);
    }
    return clean;
  }

  return value;
}

function sanitizeInPlace(target) {
  if (!target || typeof target !== 'object') return;
  for (const key of Object.keys(target)) {
    if (FORBIDDEN_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
      delete target[key];
      continue;
    }
    target[key] = sanitizeValue(target[key]);
  }
}

export async function initializeSecurityCollections() {
  const collection = mongoose.connection.collection(RATE_LIMIT_COLLECTION);
  await collection.createIndex({ key: 1 }, { unique: true, name: 'unique_security_rate_key' });
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'security_rate_ttl' });
}

async function incrementSecurityCounter(key, windowMs) {
  const collection = mongoose.connection.collection(RATE_LIMIT_COLLECTION);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);
  const update = [{
    $set: {
      count: {
        $cond: [
          { $gt: ['$expiresAt', now] },
          { $add: [{ $ifNull: ['$count', 0] }, 1] },
          1
        ]
      },
      expiresAt: {
        $cond: [
          { $gt: ['$expiresAt', now] },
          '$expiresAt',
          expiresAt
        ]
      }
    }
  }];

  try {
    const result = await collection.findOneAndUpdate(
      { key },
      update,
      { upsert: true, returnDocument: 'after' }
    );
    return result?.value || result;
  } catch (error) {
    if (error?.code !== 11000) throw error;

    const result = await collection.findOneAndUpdate(
      { key },
      update,
      { returnDocument: 'after' }
    );
    return result?.value || result;
  }
}

async function setLoginBlockExpiration(key) {
  const blockedUntil = new Date(Date.now() + LOGIN_LOCK_DURATION_MS);
  await mongoose.connection.collection(RATE_LIMIT_COLLECTION).updateOne(
    { key },
    { $set: { blockedUntil, expiresAt: blockedUntil } }
  );
  return blockedUntil;
}

/**
 * Middleware que bloquea cualquier IP con bloqueo temporal activo.
 */
export async function checkLoginIpBlock(req, res, next) {
  const ip = getClientIp(req);
  const key = `login-failures:${ip}`;
  try {
    const collection = mongoose.connection.collection(RATE_LIMIT_COLLECTION);
    const entry = await collection.findOne({ key });
    const now = Date.now();
    let blockedUntil = entry?.blockedUntil;

    if (
      entry?.count >= LOGIN_FAILURE_LIMIT &&
      !blockedUntil &&
      entry.expiresAt?.getTime() > now
    ) {
      blockedUntil = await setLoginBlockExpiration(key);
      const updatedEntry = await collection.findOne({ key });
      blockedUntil = updatedEntry?.blockedUntil || blockedUntil;
    }

    if (entry?.count >= LOGIN_FAILURE_LIMIT && blockedUntil && new Date(blockedUntil).getTime() > now) {
      const secondsRemaining = Math.max(1, Math.ceil((new Date(blockedUntil).getTime() - now) / 1000));
      res.setHeader('Retry-After', String(secondsRemaining));
      return res.status(429).json({
        ok: false,
        bloqueado: true,
        segundosRestantes: secondsRemaining,
        mensaje: `Demasiados intentos fallidos. Reintenta en ${secondsRemaining} segundos.`
      });
    }

    return next();
  } catch (error) {
    logError('login rate-limit check', error);
    return res.status(503).json({
      ok: false,
      mensaje: 'El servicio de autenticación no está disponible temporalmente.'
    });
  }
}

export async function registerFailedLoginAttempt(req) {
  const ip = getClientIp(req);
  const key = `login-failures:${ip}`;
  const entry = await incrementSecurityCounter(key, LOGIN_FAILURE_WINDOW_MS);
  const attempts = entry.count;
  const blockedUntil = attempts >= LOGIN_FAILURE_LIMIT
    ? await setLoginBlockExpiration(key)
    : null;
  const retryAfterSeconds = blockedUntil
    ? Math.max(1, Math.ceil((blockedUntil.getTime() - Date.now()) / 1000))
    : 0;
  return {
    blocked: attempts >= LOGIN_FAILURE_LIMIT,
    permanent: false,
    attemptsLeft: Math.max(0, LOGIN_FAILURE_LIMIT - attempts),
    retryAfterSeconds
  };
}

export async function clearFailedLoginAttempts(req) {
  await mongoose.connection.collection(RATE_LIMIT_COLLECTION).deleteOne({
    key: `login-failures:${getClientIp(req)}`
  });
}

export function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_TTL_MS,
    path: '/api'
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api'
  });
}

export function requireTrustedOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin || !getAllowedOrigins().has(origin)) {
    return res.status(403).json({
      ok: false,
      mensaje: 'Origen no autorizado.'
    });
  }
  return next();
}

/**
 * Firma y verifica tokens de sesión con expiración estricta de 10 minutos.
 * El token incluye la IP del cliente para prevenir robo y reutilización.
 */
export function createSessionToken(userPayload, clientIp) {
  const iat = Date.now();
  const exp = iat + SESSION_TTL_MS;
  const payload = {
    ...userPayload,
    iat,
    exp,
    _ip: clientIp || 'unknown'
  };

  const secret = getSessionSecret();
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: exp,
    sessionDurationMs: SESSION_TTL_MS
  };
}

export function verifySessionToken(token, clientIp) {
  if (typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, reason: 'missing' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'malformed' };
  }

  const [encodedPayload, signature] = parts;
  const secret = getSessionSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, reason: 'invalid_signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload?.exp || Date.now() >= payload.exp) {
      return { valid: false, reason: 'expired' };
    }
    // Verificar que el token se use desde la misma IP con la que fue creado
    if (payload._ip && clientIp && payload._ip !== 'unknown' && payload._ip !== clientIp) {
      return { valid: false, reason: 'ip_mismatch' };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'malformed' };
  }
}

export function requireActiveSession(req, res, next) {
  const cookieHeader = req.headers.cookie || '';
  const tokenCookie = cookieHeader.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  const token = tokenCookie ? tokenCookie.slice(SESSION_COOKIE_NAME.length + 1) : '';
  const clientIp = getClientIp(req);
  const result = verifySessionToken(token, clientIp);

  if (!result.valid) {
    const isIpMismatch = result.reason === 'ip_mismatch';
    return res.status(401).json({
      ok: false,
      expired: result.reason === 'expired',
      mensaje: result.reason === 'expired'
        ? 'Tu sesión expiró al alcanzar el tiempo máximo de 10 minutos. Inicia sesión nuevamente.'
        : isIpMismatch
          ? 'Token inválido: tu sesión fue iniciada desde una dirección IP diferente.'
          : 'Sesión inválida o no autorizada.'
    });
  }

  req.sessionUser = result.payload;
  return next();
}

/**
 * Cabeceras de seguridad HTTP para endurecer respuestas de la API.
 */
export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control', 'no-store');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

/**
 * Configuración estricta de CORS basada en lista blanca de orígenes.
 */
function getAllowedOrigins() {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  ];
  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set(envOrigins.length > 0 ? envOrigins : defaultOrigins);
}

export function createCorsMiddleware() {
  const allowedOrigins = getAllowedOrigins();
  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      const err = new Error('Origen no permitido por la política CORS');
      err.status = 403;
      return callback(err);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
    maxAge: 86400
  });
}

/**
 * Rechaza código SQL/script e inyección NoSQL en cualquier entrada antes de llegar a la BD.
 */
export async function sanitizeInput(req, res, next) {
  const bodyHasForbiddenKeys = hasForbiddenOperatorKey(req.body);
  if (
    hasDangerousCode(req.body) ||
    hasDangerousCode(req.params) ||
    hasDangerousCode(req.query)
  ) {
    if (bodyHasForbiddenKeys) {
      try {
        const entry = await incrementSecurityCounter(
          `operator-injection:${getClientIp(req)}`,
          ATTACK_STRIKE_WINDOW_MS
        );
        if (entry.count >= ATTACK_STRIKE_LIMIT) {
          await blockAddressPermanently(
            getClientIp(req),
            PERMANENT_BLOCK_REASON,
            req
          );
        }
      } catch (error) {
        logError('suspicious input tracking', error);
        return res.status(503).json({
          ok: false,
          mensaje: 'La validación de seguridad no está disponible temporalmente.'
        });
      }
    }

    return res.status(400).json({
      ok: false,
      mensaje: 'Entrada rechazada por seguridad: no se permite ingresar código SQL ni operadores peligrosos.'
    });
  }

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  sanitizeInPlace(req.params);
  sanitizeInPlace(req.query);
  return next();
}

/**
 * Limitador persistente por IP, compartido entre procesos mediante MongoDB.
 */
export function createRateLimiter({ keyPrefix = 'api', windowMs, max, message }) {
  return async (req, res, next) => {
    try {
      const entry = await incrementSecurityCounter(
        `rate:${keyPrefix}:${getClientIp(req)}`,
        windowMs
      );
      const remaining = Math.max(0, max - entry.count);
      const retryAfterSec = Math.max(1, Math.ceil((entry.expiresAt.getTime() - Date.now()) / 1000));

      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(remaining));
      res.setHeader('RateLimit-Reset', String(retryAfterSec));

      if (entry.count > max) {
        res.setHeader('Retry-After', String(retryAfterSec));
        return res.status(429).json({
          ok: false,
          mensaje: message || 'Demasiadas solicitudes. Intenta nuevamente más tarde.'
        });
      }

      return next();
    } catch (error) {
      logError('persistent rate limiter', error);
      return res.status(503).json({
        ok: false,
        mensaje: 'El servicio de control de solicitudes no está disponible temporalmente.'
      });
    }
  };
}

/**
 * Maneja errores del parser JSON (cuerpo malformado o payload demasiado grande).
 */
export function bodyParserErrorHandler(err, _req, res, next) {
  if (err?.type === 'entity.too.large' || err?.status === 413) {
    return res.status(413).json({
      ok: false,
      mensaje: 'El tamaño de la petición excede el límite permitido.'
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      ok: false,
      mensaje: 'El cuerpo de la petición no es un JSON válido.'
    });
  }

  return next(err);
}

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE BLOQUEO PERMANENTE POR IP + MAC (Anti-backdoor)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cache en memoria de IPs ya bloqueadas para no consultar MongoDB en cada petición.
 * Se recarga desde la BD al arrancar el servidor.
 */
const ipBlacklistCache = new Set();

/**
 * Carga inicial del cache de IPs bloqueadas desde MongoDB.
 * Llamar una sola vez al arrancar el servidor.
 */
export async function loadBlacklistCache() {
  try {
    const bloqueadas = await BlacklistedAddress.find({ motivo: PERMANENT_BLOCK_REASON }, 'ip').lean();
    for (const doc of bloqueadas) {
      ipBlacklistCache.add(doc.ip);
    }
    console.log(`[SEGURIDAD] Cache de bloqueo inicializado con ${ipBlacklistCache.size} IPs bloqueadas.`);

    // Refrescar el cache cada 60 segundos para sincronizar entre múltiples instancias
    const refreshTimer = setInterval(async () => {
      try {
        const actualizadas = await BlacklistedAddress.find({ motivo: PERMANENT_BLOCK_REASON }, 'ip').lean();
        ipBlacklistCache.clear();
        for (const doc of actualizadas) {
          ipBlacklistCache.add(doc.ip);
        }
      } catch (err) {
        console.error('[SEGURIDAD] Error refrescando cache de bloqueo:', err.message);
      }
    }, 60 * 1000);
    refreshTimer.unref();
  } catch (err) {
    console.error('[SEGURIDAD] Error cargando cache de bloqueo:', err.message);
    throw err;
  }
}

/**
 * Logger seguro para producción: solo muestra el mensaje de error, no el stack trace.
 * En desarrollo muestra el error completo.
 */
export function logError(context, err) {
  if (process.env.NODE_ENV === 'production') {
    console.error(`[ERROR] ${context}: ${err?.message || 'Error desconocido'}`);
  } else {
    console.error(`[ERROR] ${context}:`, err);
  }
}

/**
 * Bloquea permanentemente una IP en MongoDB + cache.
 */
async function blockAddressPermanently(ip, motivo, req) {
  // Agregar al cache inmediatamente para bloquear las siguientes peticiones sin ir a BD
  ipBlacklistCache.add(ip);

  const rutaIntentada = req?.originalUrl || req?.url || null;
  const metodo = req?.method || null;
  const userAgent = req?.headers?.['user-agent']?.slice(0, 512) || null;

  try {
    await BlacklistedAddress.findOneAndUpdate(
      { ip },
      {
        $set: { mac: null, motivo, rutaIntentada, metodo, userAgent },
        $inc: { intentos: 1 },
        $setOnInsert: { bloqueadoEn: new Date() }
      },
      { upsert: true, new: true }
    );
    console.warn(
      `[SEGURIDAD] 🚫 BLOQUEO PERMANENTE — IP: ${ip} | Motivo: ${motivo} | Ruta: ${rutaIntentada}`
    );
  } catch (err) {
    ipBlacklistCache.delete(ip);
    console.error('[SEGURIDAD] Error al persistir bloqueo en MongoDB:', err.message);
    throw err;
  }
}

export async function removeBlacklistedAddress(ip) {
  const result = await BlacklistedAddress.deleteOne({ ip });
  if (result.deletedCount > 0) {
    ipBlacklistCache.delete(ip);
  }
  return result;
}

/**
 * Middleware principal anti-backdoor.
 * - Bloquea al instante cualquier IP ya en lista negra.
 * - Deja las rutas desconocidas en manos del manejador 404 normal.
 */
export async function backdoorBlocker(req, res, next) {
  const ip = getClientIp(req);

  // 1. ¿La IP ya está bloqueada permanentemente?
  if (ipBlacklistCache.has(ip)) {
    console.warn(`[SEGURIDAD] 🚫 Petición rechazada de IP bloqueada: ${ip} → ${req.originalUrl}`);
    return res.status(403).json({
      ok: false,
      bloqueado: true,
      mensaje: 'Tu dirección ha sido bloqueada permanentemente por actividad sospechosa. Contacta al administrador del sistema.'
    });
  }

  return next();
}

/**
 * Verifica en cada petición autenticada si el usuario intenta manipular
 * el token o acceder con una sesión de una IP distinta a la original.
 * Bloquea y registra si detecta inconsistencia.
 */
export async function sessionIntegrityGuard(req, res, next) {
  const ip = getClientIp(req);

  // Si ya está bloqueada, cortar inmediatamente
  if (ipBlacklistCache.has(ip)) {
    return res.status(403).json({
      ok: false,
      bloqueado: true,
      mensaje: 'Tu dirección ha sido bloqueada permanentemente.'
    });
  }

  // Detectar headers de proxy/exploit sospechosos
  const suspiciousHeaders = [
    'x-original-url',
    'x-rewrite-url',
    'x-custom-ip-authorization',
    'x-originating-ip'
  ];

  const suspiciousFound = suspiciousHeaders.filter((h) => req.headers[h]);
  if (suspiciousFound.length > 0) {
    console.warn(`[SEGURIDAD] Encabezados no permitidos de ${ip}: ${suspiciousFound.join(', ')}`);
    return res.status(400).json({
      ok: false,
      mensaje: 'La solicitud contiene encabezados no permitidos.'
    });
  }

  return next();
}

/**
 * Maneja el caso 404 normal (ruta de API no encontrada).
 * Para rutas completamente fuera del ámbito de la API, backdoorBlocker
 * ya habrá actuado antes de llegar aquí.
 */
export function notFoundHandler(_req, res) {
  res.status(404).json({
    ok: false,
    mensaje: 'Ruta no encontrada en la API de Astro Bank.'
  });
}

export function globalErrorHandler(err, _req, res, _next) {
  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600
    ? err.status
    : 500;

  if (status >= 500) {
    console.error('Error no controlado en la API:', err);
  }

  res.status(status).json({
    ok: false,
    mensaje: status >= 500
      ? 'Error interno del servidor.'
      : err?.message || 'Solicitud rechazada.'
  });
}
