import { Router } from 'express';
import { BlacklistedAddress } from '../models/BlacklistedAddress.js';
import { requireActiveSession } from '../middlewares/security.js';

const router = Router();

/**
 * Todas las rutas admin requieren sesión activa con rol 'admin'.
 */
function requireAdmin(req, res, next) {
  if (req.sessionUser?.rol !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'Acceso restringido a administradores.' });
  }
  return next();
}

/**
 * GET /api/admin/blacklist
 * Lista todas las IPs/MACs bloqueadas.
 */
router.get('/blacklist', requireActiveSession, requireAdmin, async (_req, res) => {
  try {
    const bloqueadas = await BlacklistedAddress.find()
      .sort({ bloqueadoEn: -1 })
      .lean();
    return res.json({ ok: true, total: bloqueadas.length, bloqueadas });
  } catch (err) {
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener la lista de bloqueos.' });
  }
});

/**
 * DELETE /api/admin/blacklist/:ip
 * Desbloquea manualmente una IP (y elimina su registro de la BD + cache).
 */
router.delete('/blacklist/:ip', requireActiveSession, requireAdmin, async (req, res) => {
  const { ip } = req.params;
  try {
    const result = await BlacklistedAddress.deleteOne({ ip });
    if (result.deletedCount === 0) {
      return res.status(404).json({ ok: false, mensaje: `La IP ${ip} no está en la lista de bloqueos.` });
    }
    return res.json({ ok: true, mensaje: `IP ${ip} desbloqueada y eliminada de la lista negra.` });
  } catch (err) {
    return res.status(500).json({ ok: false, mensaje: 'Error al desbloquear la IP.' });
  }
});

export default router;
