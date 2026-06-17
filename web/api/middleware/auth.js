const jwt = require('jsonwebtoken');

// Middleware de autenticación JWT para rutas protegidas
const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token de autenticación requerido' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoqosqo_web_secret_2026');
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware opcional: carga el usuario si hay token, pero no bloquea
const authOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return next();

  try {
    const decoded = jwt.verify(parts[1], process.env.JWT_SECRET || 'ecoqosqo_web_secret_2026');
    req.usuario = decoded;
  } catch (err) {
    // Token inválido, pero no bloqueamos
  }
  next();
};

// Middleware de autorización por rol
const requireRole = (...rolesPermitidos) => {
  const allowed = rolesPermitidos.map((r) => r.toUpperCase().trim());
  return (req, res, next) => {
    const rolUsuario = (req.usuario?.rol || '').toUpperCase().trim();
    if (!rolUsuario) {
      return res.status(403).json({ message: 'No se pudo determinar el rol del usuario' });
    }
    if (!allowed.includes(rolUsuario)) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
    }
    next();
  };
};

module.exports = { authRequired, authOptional, requireRole };
