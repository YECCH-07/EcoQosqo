const cors = require('cors');
const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const privateRoutes = require('./routes/privateRoutes');
const rutaRoutes = require('./routes/rutaRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { authenticateToken } = require('./middleware/authMiddleware');
const uploadController = require('./controllers/uploadController');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir archivos estáticos (fotos de reportes)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API App EcoQosqo funcionando' });
});

// Upload de imágenes
app.post('/api/upload', authenticateToken, uploadController.subirImagen);

app.use('/api/auth', authRoutes);
app.use('/api', privateRoutes);
app.use('/api', rutaRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
