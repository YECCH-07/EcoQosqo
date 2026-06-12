const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personalController');
const { authRequired } = require('../middleware/auth');

// Tipos de personal (público para lectura, protegido para escritura)
router.get('/tipos-personal', personalController.listarTipos);
router.post('/tipos-personal', authRequired, personalController.crearTipo);

// Personal (protegido)
router.get('/personal', authRequired, personalController.listar);
router.get('/personal/buscar', authRequired, personalController.buscar);
router.get('/personal/:id', authRequired, personalController.obtener);
router.post('/personal', authRequired, personalController.crear);
router.put('/personal/:id', authRequired, personalController.actualizar);
router.delete('/personal/:id', authRequired, personalController.eliminar);

module.exports = router;
