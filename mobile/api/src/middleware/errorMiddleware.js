const { nodeEnv } = require('../config/env');

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  res.status(status).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(nodeEnv === 'development' ? { stack: error.stack } : {})
  });
}

module.exports = {
  notFound,
  errorHandler
};
