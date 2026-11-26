import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import {
  securityHeaders,
  createCorsMiddleware,
  sanitizeInput,
  createRateLimiter,
  initializeSecurityCollections,
  bodyParserErrorHandler,
  notFoundHandler,
  globalErrorHandler,
  backdoorBlocker,
  sessionIntegrityGuard,
  loadBlacklistCache,
  validateSecurityConfig
} from './middlewares/security.js';


const app = express();
const port = Number(process.env.PORT) || 4000;
const configuredTrustProxy = process.env.TRUST_PROXY;

// Endurecimiento básico de Express
app.disable('x-powered-by');
app.set('trust proxy', !configuredTrustProxy || configuredTrustProxy === 'false'
  ? false
  : configuredTrustProxy);
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.status(426).json({
      ok: false,
      mensaje: 'El servicio requiere una conexión HTTPS.'
    });
  }
  return next();
});

// Capas globales de seguridad
app.use(securityHeaders);
app.use(createCorsMiddleware());
app.use(express.json({ limit: '100kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(bodyParserErrorHandler);
app.use(sanitizeInput);

// ── Anti-backdoor: bloquea IPs/MACs de rutas no autorizadas ──────────────────
// Se aplica ANTES de cualquier ruta de negocio.
app.use(sessionIntegrityGuard);  // Detecta headers de exploit/proxy sospechosos
app.use(backdoorBlocker);        // Bloquea rutas fuera de la lista blanca

// Control de tráfico para estabilidad y protección contra fuerza bruta
const apiLimiter = createRateLimiter({
  keyPrefix: 'api',
  windowMs: 60 * 1000,
  max: 120,
  message: 'Límite de solicitudes excedido. Intenta de nuevo en un minuto.'
});

const authLimiter = createRateLimiter({
  keyPrefix: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes de autenticación. Espera unos minutos antes de reintentar.'
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);

// Verificación de salud del servicio y la base de datos
app.get('/health', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    ok: dbReady,
    status: dbReady ? 'ok' : 'degraded',
    database: dbReady ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

let httpServer = null;

async function shutdown(signal) {
  console.log(`\nSeñal ${signal} recibida. Cerrando servidor de forma segura...`);
  try {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error durante el cierre del servidor:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Promesa rechazada no manejada:', reason);
});

async function startServer() {
  // Verificar configuración de seguridad obligatoria antes de arrancar
  validateSecurityConfig();

  await connectDB();
  await initializeSecurityCollections();

  // Cargar el bloqueo persistente antes de aceptar peticiones.
  await loadBlacklistCache();

  httpServer = app.listen(port, () => {
    console.log(`Backend escuchando en http://localhost:${port}`);
  });

  // Protección contra conexiones lentas (Slowloris)
  httpServer.requestTimeout = 15000;
  httpServer.headersTimeout = 20000;
  httpServer.keepAliveTimeout = 5000;
}

startServer().catch((error) => {
  console.error('No se pudo iniciar el backend:', error);
  process.exit(1);
});
