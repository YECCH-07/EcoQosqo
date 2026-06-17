const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');
const asignacionController = require('../controllers/asignacionRutaController');
const { authRequired, requireRole } = require('../middleware/auth');

const RUTA_ROLES = ['ADMIN', 'OPERADOR'];

// ─── Rutas — Lectura ──────────────────────────────
router.get('/rutas', authRequired, rutaController.listar);
router.get('/rutas/:id', authRequired, rutaController.obtener);
router.get('/rutas/:id/puntos', authRequired, rutaController.obtenerPuntos);

// ─── Rutas — Escritura ─────────────────────────────
router.post('/rutas', authRequired, requireRole(...RUTA_ROLES), rutaController.crear);
router.put('/rutas/:id', authRequired, requireRole(...RUTA_ROLES), rutaController.actualizar);
router.delete('/rutas/:id', authRequired, requireRole(...RUTA_ROLES), rutaController.eliminar);
router.put('/rutas/:id/puntos', authRequired, requireRole(...RUTA_ROLES), rutaController.guardarPuntos);

// ─── Asignaciones — Lectura ─────────────────────────
router.get('/asignaciones-ruta', authRequired, asignacionController.listar);
router.get('/asignaciones-ruta/:id', authRequired, asignacionController.obtener);

// ─── Asignaciones — Escritura ───────────────────────
router.post('/asignaciones-ruta', authRequired, requireRole(...RUTA_ROLES), asignacionController.crear);
router.put('/asignaciones-ruta/:id', authRequired, requireRole(...RUTA_ROLES), asignacionController.actualizar);
router.delete('/asignaciones-ruta/:id', authRequired, requireRole(...RUTA_ROLES), asignacionController.eliminar);

module.exports = router;
