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
router.post('/reportes', authenticateToken, reportController.create);

module.exports = router;
