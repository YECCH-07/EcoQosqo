const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const { authRequired, requireRole } = require('../middleware/auth');

const ROLES = ['ADMIN', 'OPERADOR'];

router.get('/equipos', authRequired, equipoController.listar);
router.get('/equipos/:id', authRequired, equipoController.obtener);
router.post('/equipos', authRequired, requireRole(...ROLES), equipoController.crear);
router.put('/equipos/:id', authRequired, requireRole(...ROLES), equipoController.actualizar);
router.delete('/equipos/:id', authRequired, requireRole(...ROLES), equipoController.eliminar);

module.exports = router;
