const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personalController');
const { authRequired, requireRole } = require('../middleware/auth');

const PERSONAL_ROLES = ['ADMIN', 'RECURSOS'];

// Tipos de personal
router.get('/tipos-personal', authRequired, personalController.listarTipos);
router.post('/tipos-personal', authRequired, requireRole(...PERSONAL_ROLES), personalController.crearTipo);

// Personal
router.get('/personal', authRequired, personalController.listar);
router.get('/personal/buscar', authRequired, personalController.buscar);
router.get('/personal/:id', authRequired, personalController.obtener);
router.post('/personal', authRequired, requireRole(...PERSONAL_ROLES), personalController.crear);
router.put('/personal/:id', authRequired, requireRole(...PERSONAL_ROLES), personalController.actualizar);
router.delete('/personal/:id', authRequired, requireRole(...PERSONAL_ROLES), personalController.eliminar);

module.exports = router;
