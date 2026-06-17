const { Router } = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const rutaController = require('../controllers/rutaController');

const router = Router();

router.get('/rutas/cercana', authenticateToken, rutaController.cercana);
router.get('/rutas', authenticateToken, rutaController.listar);
router.get('/rutas/:id', authenticateToken, rutaController.obtener);

module.exports = router;
