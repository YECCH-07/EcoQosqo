const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    req.usuario = jwt.verify(token, jwtConfig.secret);
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
}

module.exports = {
  authenticateToken
};
