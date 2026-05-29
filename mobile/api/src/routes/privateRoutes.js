const { Router } = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = Router();

router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    usuario: req.usuario
  });
});

module.exports = router;
