const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const mantenimientoController = require('../controllers/mantenimientoController');
const { authRequired, requireRole } = require('../middleware/auth');

const VEHICULO_ROLES = ['ADMIN', 'MAQUINARIAS'];

// ─── Vehículos — Lectura ────────────────────────────
router.get('/vehiculos', authRequired, vehiculoController.listar);
router.get('/vehiculos/buscar', authRequired, vehiculoController.buscar);
router.get('/vehiculos/unidad/:id', authRequired, vehiculoController.listarPorUnidad);
router.get('/vehiculos/alertas', authRequired, vehiculoController.alertas);
router.get('/vehiculos/:id', authRequired, vehiculoController.obtener);

// ─── Vehículos — Escritura ───────────────────────────
router.post('/vehiculos', authRequired, requireRole(...VEHICULO_ROLES), vehiculoController.crear);
router.put('/vehiculos/:id', authRequired, requireRole(...VEHICULO_ROLES), vehiculoController.actualizar);
router.delete('/vehiculos/:id', authRequired, requireRole(...VEHICULO_ROLES), vehiculoController.eliminar);

// ─── Notificaciones masivas ──────────────────────────
router.post('/vehiculos/generar-alertas', authRequired, requireRole(...VEHICULO_ROLES), vehiculoController.generarNotificaciones);

// ─── Mantenimientos — Lectura ────────────────────────
router.get('/vehiculos/:vehiculoId/mantenimientos', authRequired, mantenimientoController.listarPorVehiculo);
router.get('/mantenimientos/programados', authRequired, mantenimientoController.listarProgramados);
router.get('/mantenimientos/:id', authRequired, mantenimientoController.obtener);

// ─── Mantenimientos — Escritura ──────────────────────
router.post('/vehiculos/:vehiculoId/mantenimientos', authRequired, requireRole(...VEHICULO_ROLES), mantenimientoController.crear);
router.put('/mantenimientos/:id', authRequired, requireRole(...VEHICULO_ROLES), mantenimientoController.actualizar);
router.delete('/mantenimientos/:id', authRequired, requireRole(...VEHICULO_ROLES), mantenimientoController.eliminar);

module.exports = router;
