const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const personalRoutes = require('./routes/personalRoutes');
const unidadOrganicaRoutes = require('./routes/unidadOrganicaRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Trust proxy para rate limiting correcto detrás de reverse proxy
app.set('trust proxy', 1);

// CORS: permitir solo el frontend de desarrollo
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Body parser con límite de tamaño
app.use(bodyParser.json({ limit: '5mb' }));

// Auth
app.use('/api', authRoutes);

// Módulos operativos (protegidos por JWT en rutas)
app.use('/api', personalRoutes);
app.use('/api', unidadOrganicaRoutes);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
