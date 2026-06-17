const { Router } = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');
const notificationController = require('../controllers/notificationController');
const reportController = require('../controllers/reportController');

const router = Router();

// Perfil
router.get('/me', authenticateToken, profileController.me);

// Notificaciones
router.get('/notificaciones', authenticateToken, notificationController.list);
router.patch('/notificaciones/:id/leido', authenticateToken, notificationController.markAsRead);

// Reportes
router.get('/reportes', authenticateToken, reportController.list);
router.get('/reportes/:id', authenticateToken, reportController.obtener);
router.post('/reportes', authenticateToken, reportController.create);

// Ruta del usuario (asignación por GPS)
const { pool } = require('../config/db');
const rutaModel = require('../models/rutaModel');

router.post('/usuario/asignar-ruta', authenticateToken, async (req, res, next) => {
  try {
    const { lat, lng, ruta_id } = req.body;
    let rutaAsignada;
    if (ruta_id) {
      // Asignación manual
      rutaAsignada = await rutaModel.findById(Number(ruta_id));
      if (!rutaAsignada) return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
    } else {
      // Asignación automática por GPS
      if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat y lng requeridos' });
      const resultado = await rutaModel.findNearest(Number(lat), Number(lng));
      if (!resultado) return res.status(404).json({ success: false, message: 'No se encontraron rutas cercanas' });
      rutaAsignada = resultado.ruta;
    }
    await pool.execute('INSERT INTO usuario_rutas (usuario_id, ruta_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE ruta_id = ?', [req.usuario.id, rutaAsignada.id, rutaAsignada.id]);
    return res.json({ success: true, ruta: rutaAsignada });
  } catch (err) { next(err); }
});

router.get('/usuario/mi-ruta', authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT r.*, ur.asignado_en FROM usuario_rutas ur JOIN rutas r ON ur.ruta_id = r.id WHERE ur.usuario_id = ?', [req.usuario.id]);
    if (!rows.length) return res.json({ success: false, message: 'No tienes ruta asignada' });
    const full = await rutaModel.findById(rows[0].id);
    return res.json({ success: true, ruta: full || rows[0], asignado_en: rows[0].asignado_en });
  } catch (err) { next(err); }
});

module.exports = router;
