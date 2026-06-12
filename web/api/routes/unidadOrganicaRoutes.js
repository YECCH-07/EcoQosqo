const express = require('express');
const router = express.Router();
const controller = require('../controllers/unidadOrganicaController');
const { authRequired } = require('../middleware/auth');

// Búsqueda y lectura (requiere auth)
router.get('/unidades-organicas/buscar', authRequired, controller.buscar);
router.get('/unidades-organicas/raiz/hijos', authRequired, (req, res) => controller.hijos({ params: { id: 'raiz' } }, res));
router.get('/unidades-organicas/:id/hijos', authRequired, controller.hijos);
router.get('/unidades-organicas/:id/arbol', authRequired, controller.arbol);
router.get('/unidades-organicas', authRequired, controller.listar);
router.get('/unidades-organicas/:id', authRequired, controller.obtener);

// Escritura (requiere auth)
router.post('/unidades-organicas', authRequired, controller.crear);
router.put('/unidades-organicas/:id', authRequired, controller.actualizar);
router.delete('/unidades-organicas/:id', authRequired, controller.eliminar);

module.exports = router;
