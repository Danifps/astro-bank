import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { checkLoginIpBlock, requireActiveSession, createRateLimiter } from '../middlewares/security.js';

const router = Router();

/**
 * Rate limiter estricto para el registro: máximo 3 registros por IP cada 10 minutos.
 * Previene la creación masiva de cuentas falsas desde la misma IP.
 */
const registerLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: 'Demasiados intentos de registro desde tu dirección IP. Espera 10 minutos antes de intentarlo de nuevo.'
});

router.post('/login', checkLoginIpBlock, login);
router.post('/register', registerLimiter, register);
router.get('/session', requireActiveSession, (req, res) => {
  res.json({
    ok: true,
    expiresAt: req.sessionUser.exp,
    usuario: req.sessionUser.usuario,
    rol: req.sessionUser.rol
  });
});

export default router;
