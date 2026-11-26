import crypto from 'node:crypto';
import cors from 'cors';
import { BlacklistedAddress } from '../models/BlacklistedAddress.js';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutos máximos de sesión activa
const MAX_LOGIN_FAILURES = 5;

/**
 * Duraciones de bloqueo progresivo (exponential backoff) por IP:
 * 1er bloqueo → 1 min | 2do → 5 min | 3ro → 30 min | 4to+ → ban permanente
 */
const BLOCK_DURATIONS_MS = [
  1 * 60 * 1000,
  5 * 60 * 1000,
  30 * 60 * 1000
];

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
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[SEGURIDAD CRÍTICA] SESSION_SECRET no está configurada correctamente. ' +
        'Mínimo 32 caracteres. El servidor se detiene por seguridad.'
      );
    }
    console.warn('[SEGURIDAD] ⚠️  SESSION_SECRET no configurada. No es seguro para producción.');
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

// Registro de intentos fallidos consecutivos de login por IP
// Estado: { failures, blockedUntil, blockCount, lastAttemptAt }
const loginAttemptsByIp = new Map();

const loginCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, state] of loginAttemptsByIp.entries()) {
    const isBlockedExpired = state.blockedUntil && state.blockedUntil <= now;
    const isStale = now - state.lastAttemptAt > 60 * 60 * 1000; // 1 hora sin actividad
    if (isBlockedExpired || (!state.blockedUntil && isStale)) {
      loginAttemptsByIp.delete(ip);
    }
  }
}, 60 * 1000);
loginCleanupTimer.unref();

/**
 * Middleware que bloquea cualquier IP con bloqueo temporal activo.
 */
export function checkLoginIpBlock(req, res, next) {
  const ip = getClientIp(req);
  const state = loginAttemptsByIp.get(ip);
  const now = Date.now();

  if (state?.blockedUntil && state.blockedUntil > now) {
    const segundosRestantes = Math.max(1, Math.ceil((state.blockedUntil - now) / 1000));
    res.setHeader('Retry-After', String(segundosRestantes));
    return res.status(429).json({
      ok: false,
      bloqueado: true,
      segundosRestantes,
      mensaje: `Demasiados intentos fallidos. Tu IP está bloqueada por ${segundosRestantes} segundos más.`
    });
  }

  if (state?.blockedUntil && state.blockedUntil <= now) {
    // El bloqueo temporal expiró; reiniciar failures pero conservar blockCount
    loginAttemptsByIp.set(ip, {
      failures: 0,
      blockedUntil: null,
      blockCount: state.blockCount || 0,
      lastAttemptAt: state.lastAttemptAt
    });
  }

  return next();
}

/**
 * Registra un fallo de login con bloqueo progresivo (exponential backoff).
 * Tras BLOCK_DURATIONS_MS.length bloques → ban permanente en MongoDB.
 */
export async function registerFailedLoginAttempt(req) {
  const ip = getClientIp(req);
  const mac = getClientMac(req);
  const now = Date.now();
  const prev = loginAttemptsByIp.get(ip);

  const blockCount = prev?.blockCount || 0;
  const failures = (prev && !prev.blockedUntil ? prev.failures : 0) + 1;

  if (failures >= MAX_LOGIN_FAILURES) {
    // ¿Ya superó todos los bloqueos temporales? → ban permanente
    if (blockCount >= BLOCK_DURATIONS_MS.length) {
      await blockAddressPermanently(ip, mac, `Ban permanente tras ${blockCount + 1} ciclos de bloqueo por fuerza bruta`, req);
      loginAttemptsByIp.delete(ip);
      return { blocked: true, permanent: true, attemptsLeft: 0, retryAfterSeconds: 0 };
    }

    const blockDuration = BLOCK_DURATIONS_MS[blockCount];
    const blockedUntil = now + blockDuration;
    loginAttemptsByIp.set(ip, {
      failures: 0,
      blockedUntil,
      blockCount: blockCount + 1,
      lastAttemptAt: now
    });

    return {
      blocked: true,
      permanent: false,
      attemptsLeft: 0,
      retryAfterSeconds: Math.ceil(blockDuration / 1000)
    };
  }

  loginAttemptsByIp.set(ip, {
    failures,
    blockedUntil: null,
    blockCount,
    lastAttemptAt: now
  });

  return {
    blocked: false,
    permanent: false,
    attemptsLeft: MAX_LOGIN_FAILURES - failures,
    retryAfterSeconds: 0
  };
}

export function clearFailedLoginAttempts(req) {
  loginAttemptsByIp.delete(getClientIp(req));
}

/**
 * Firma y verifica tokens de sesión con expiración estricta de 5 minutos.
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
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const clientIp = getClientIp(req);
  const result = verifySessionToken(token, clientIp);

  if (!result.valid) {
    const isIpMismatch = result.reason === 'ip_mismatch';
    return res.status(401).json({
      ok: false,
      expired: result.reason === 'expired',
      mensaje: result.reason === 'expired'
        ? 'Tu sesión expiró al alcanzar el tiempo máximo de 5 minutos. Inicia sesión nuevamente.'
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
export function createCorsMiddleware() {
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

  const allowedOrigins = new Set(envOrigins.length > 0 ? envOrigins : defaultOrigins);

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
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
  });
}

/**
 * Rechaza código SQL/script e inyección NoSQL en cualquier entrada antes de llegar a la BD.
 */
export function sanitizeInput(req, res, next) {
  if (
    hasDangerousCode(req.body) ||
    hasDangerousCode(req.params) ||
    hasDangerousCode(req.query)
  ) {
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
 * Limitador de tasa en memoria por IP (listo para reemplazar por Redis al escalar horizontalmente).
 */
export function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (entry.resetAt <= now) {
        hits.delete(key);
      }
    }
  }, windowMs);

  cleanupTimer.unref();

  return (req, res, next) => {
    const key = getClientIp(req);
    const now = Date.now();
    const existing = hits.get(key);

    if (!existing || existing.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(Math.max(0, max - 1)));
      return next();
    }

    existing.count += 1;
    const remaining = Math.max(0, max - existing.count);
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(retryAfterSec));

    if (existing.count > max) {
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        ok: false,
        mensaje: message || 'Demasiadas solicitudes. Intenta nuevamente más tarde.'
      });
    }

    return next();
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
 * Rutas legítimas de la API. Cualquier petición fuera de esta lista
 * se considera un intento de acceso por puerta trasera y se bloquea
 * permanentemente registrando la IP y la MAC del atacante en MongoDB.
 */
const RUTAS_PERMITIDAS = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/session',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/session',
  '/api/admin/blacklist',
  '/health'
]);

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
    const bloqueadas = await BlacklistedAddress.find({}, 'ip').lean();
    for (const doc of bloqueadas) {
      ipBlacklistCache.add(doc.ip);
    }
    console.log(`[SEGURIDAD] Cache de bloqueo inicializado con ${ipBlacklistCache.size} IPs bloqueadas.`);

    // Refrescar el cache cada 60 segundos para sincronizar entre múltiples instancias
    const refreshTimer = setInterval(async () => {
      try {
        const actualizadas = await BlacklistedAddress.find({}, 'ip').lean();
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
 * Extrae la dirección MAC del header X-Client-MAC enviado por el cliente,
 * o la del header Forwarded/X-Forwarded-For como aproximación de red.
 * Nota: las MACs solo se transmiten dentro de la misma red local;
 * para redes remotas se registra lo que el cliente declare.
 */
function getClientMac(req) {
  const mac = req.headers['x-client-mac'] || req.headers['x-mac-address'] || null;
  if (!mac) return null;
  // Validar formato básico de MAC (xx:xx:xx:xx:xx:xx o xx-xx-xx-xx-xx-xx)
  const macRegex = /^([0-9a-fA-F]{2}[:\-]){5}[0-9a-fA-F]{2}$/;
  return macRegex.test(mac.trim()) ? mac.trim().toUpperCase() : null;
}

/**
 * Bloquea permanentemente una IP (y MAC si está disponible) en MongoDB + cache.
 */
async function blockAddressPermanently(ip, mac, motivo, req) {
  // Agregar al cache inmediatamente para bloquear las siguientes peticiones sin ir a BD
  ipBlacklistCache.add(ip);

  const rutaIntentada = req?.originalUrl || req?.url || null;
  const metodo = req?.method || null;
  const userAgent = req?.headers?.['user-agent']?.slice(0, 512) || null;

  try {
    await BlacklistedAddress.findOneAndUpdate(
      { ip },
      {
        $set: { mac: mac || null, motivo, rutaIntentada, metodo, userAgent },
        $inc: { intentos: 1 },
        $setOnInsert: { bloqueadoEn: new Date() }
      },
      { upsert: true, new: true }
    );
    console.warn(
      `[SEGURIDAD] 🚫 BLOQUEO PERMANENTE — IP: ${ip}${mac ? ' | MAC: ' + mac : ''} | Motivo: ${motivo} | Ruta: ${rutaIntentada}`
    );
  } catch (err) {
    console.error('[SEGURIDAD] Error al persistir bloqueo en MongoDB:', err.message);
  }
}

/**
 * Prefijos de rutas permitidas para soportar segmentos dinámicos (ej. :ip).
 */
const PREFIJOS_PERMITIDOS = [
  '/api/admin/blacklist'
];

/**
 * Middleware principal anti-backdoor.
 * - Bloquea al instante cualquier IP ya en lista negra.
 * - Detecta accesos a rutas fuera de la API legítima y los bloquea permanentemente.
 */
export async function backdoorBlocker(req, res, next) {
  const ip = getClientIp(req);
  const mac = getClientMac(req);

  // 1. ¿La IP ya está bloqueada permanentemente?
  if (ipBlacklistCache.has(ip)) {
    console.warn(`[SEGURIDAD] 🚫 Petición rechazada de IP bloqueada: ${ip} → ${req.originalUrl}`);
    return res.status(403).json({
      ok: false,
      bloqueado: true,
      mensaje: 'Tu dirección ha sido bloqueada permanentemente por actividad sospechosa. Contacta al administrador del sistema.'
    });
  }

  // 2. ¿Es una ruta legítima?
  const rutaBase = req.path || req.url?.split('?')[0];
  const esPermitida =
    RUTAS_PERMITIDAS.has(rutaBase) ||
    PREFIJOS_PERMITIDOS.some((prefijo) => rutaBase.startsWith(prefijo));

  if (!esPermitida) {
    // Es un intento de acceso a ruta desconocida → tratar como backdoor
    const motivo = `Intento de acceso a ruta no autorizada: ${rutaBase}`;
    await blockAddressPermanently(ip, mac, motivo, req);

    return res.status(403).json({
      ok: false,
      bloqueado: true,
      mensaje: 'Acceso no autorizado. Tu dirección IP y MAC han sido registradas y bloqueadas permanentemente.'
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
  const mac = getClientMac(req);

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
    'x-forwarded-host',
    'x-host',
    'x-custom-ip-authorization',
    'x-originating-ip'
  ];

  const suspiciousFound = suspiciousHeaders.filter((h) => req.headers[h]);
  if (suspiciousFound.length > 0) {
    const motivo = `Headers de proxy/exploit sospechosos detectados: ${suspiciousFound.join(', ')}`;
    await blockAddressPermanently(ip, mac, motivo, req);
    return res.status(403).json({
      ok: false,
      bloqueado: true,
      mensaje: 'Actividad sospechosa detectada. Tu dirección ha sido bloqueada permanentemente.'
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
