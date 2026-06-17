const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const notificacionesController = require('../controllers/notificacionesController');
const reportesController = require('../controllers/reportesController');
const { authRequired, requireRole } = require('../middleware/auth');

const NOTIF_ROLES = ['ADMIN', 'OPERADOR DE NOTIFICACIONES'];

// Dashboard
router.get('/dashboard', authRequired, dashboardController.resumen);

// Notificaciones
router.get('/notificaciones', authRequired, notificacionesController.listar);
router.post('/notificaciones', authRequired, requireRole(...NOTIF_ROLES), notificacionesController.crear);

// Reportes
router.get('/reportes', authRequired, reportesController.listar);
router.get('/reportes/:id', authRequired, reportesController.obtener);
router.patch('/reportes/:id/estado', authRequired, requireRole(...NOTIF_ROLES), reportesController.cambiarEstado);
router.post('/reportes/:id/responder', authRequired, requireRole(...NOTIF_ROLES), reportesController.responder);

module.exports = router;
