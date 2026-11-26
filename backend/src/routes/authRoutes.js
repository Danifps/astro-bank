import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import {
  checkLoginIpBlock,
  clearSessionCookie,
  createRateLimiter,
  requireActiveSession,
  requireTrustedOrigin,
  sanitizeInput
} from '../middlewares/security.js';
import { parseRegistrationPayload, uploadDocument } from '../middlewares/documentUpload.js';

const router = Router();

/**
 * Rate limiter estricto para el registro: máximo 3 registros por IP cada 10 minutos.
 * Previene la creación masiva de cuentas falsas desde la misma IP.
 */
const registerLimiter = createRateLimiter({
  keyPrefix: 'register',
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: 'Demasiados intentos de registro desde tu dirección IP. Espera 10 minutos antes de intentarlo de nuevo.'
});

router.post('/login', requireTrustedOrigin, checkLoginIpBlock, login);
router.post('/register', requireTrustedOrigin, registerLimiter, uploadDocument, parseRegistrationPayload, sanitizeInput, register);
router.post('/logout', requireTrustedOrigin, (_req, res) => {
  clearSessionCookie(res);
  return res.status(204).end();
});
router.get('/session', requireActiveSession, (req, res) => {
  res.json({
    ok: true,
    expiresAt: req.sessionUser.exp,
    usuario: req.sessionUser.usuario,
    rol: req.sessionUser.rol
  });
});

export default router;
