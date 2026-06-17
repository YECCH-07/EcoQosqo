const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { authRequired, requireRole } = require('../middleware/auth');

const ADMIN_ROLES = ['ADMIN'];

router.get('/usuarios/contador', authRequired, requireRole(...ADMIN_ROLES), usuariosController.contador);
router.get('/usuarios', authRequired, requireRole(...ADMIN_ROLES), usuariosController.listar);
router.get('/usuarios/:id', authRequired, requireRole(...ADMIN_ROLES), usuariosController.obtener);
router.post('/usuarios', authRequired, requireRole(...ADMIN_ROLES), usuariosController.crear);
router.put('/usuarios/:id', authRequired, requireRole(...ADMIN_ROLES), usuariosController.actualizar);
router.patch('/usuarios/:id/password', authRequired, requireRole(...ADMIN_ROLES), usuariosController.cambiarPassword);
router.delete('/usuarios/:id', authRequired, requireRole(...ADMIN_ROLES), usuariosController.eliminar);

module.exports = router;
