const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Intentos fallidos por IP (en memoria)
const attemptsByIP = new Map();
const MAX_ATTEMPTS = 5;
const BLOCK_MINUTES = 15;

// Limpieza periódica de entradas expiradas (cada 10 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of attemptsByIP) {
    if (record.blockUntil && now >= record.blockUntil) {
      attemptsByIP.delete(ip);
    }
  }
}, 10 * 60 * 1000);

const checkBruteForce = (ip, res) => {
  const now = Date.now();
  const record = attemptsByIP.get(ip);

  if (record && record.blockUntil && now < record.blockUntil) {
    const remaining = Math.ceil((record.blockUntil - now) / 60000);
    res.status(429).json({
      message: `Demasiados intentos. Intente de nuevo en ${remaining} minuto(s).`,
    });
    return false;
  }

  if (record && record.blockUntil && now >= record.blockUntil) {
    attemptsByIP.delete(ip);
  }

  return true;
};

const recordFailedAttempt = (ip) => {
  const now = Date.now();
  const record = attemptsByIP.get(ip) || { count: 0, blockUntil: null };
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.blockUntil = now + BLOCK_MINUTES * 60000;
  }

  attemptsByIP.set(ip, record);
};

const resetAttempts = (ip) => {
  attemptsByIP.delete(ip);
};

const login = (req, res) => {
  const { usuario, password, rememberMe } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;

  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
  }

  if (!checkBruteForce(clientIP, res)) return;

  userModel.findUserByUsername(usuario, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor. Intente nuevamente.' });
    }

    // No revelar si el usuario existe o no (evita enumeración)
    if (!user) {
      recordFailedAttempt(clientIP);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Buscar la contraseña hasheada en la BD
    const storedPassword = user.password_hash || user.password || user.contrasena || user.contraseña || '';

    // Solo aceptar bcrypt — sin fallback a texto plano
    const isHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

    if (!isHashed) {
      console.error(`⚠ Usuario "${usuario}" tiene contraseña sin hash. Acceso bloqueado por seguridad.`);
      return res.status(500).json({ message: 'Error de configuración de seguridad. Contacte al administrador.' });
    }

    bcrypt.compare(password, storedPassword, (compareErr, match) => {
      if (compareErr) {
        return res.status(500).json({ message: 'Error en el servidor. Intente nuevamente.' });
      }

      if (!match) {
        recordFailedAttempt(clientIP);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Login exitoso — limpiar contador
      resetAttempts(clientIP);

      const rolNombre = (String(user.rol || '')).toUpperCase().trim() || 'SIN_ROL';
      // Roles que solo acceden al aplicativo móvil, NO al panel web
      const rolesSinPanelWeb = ['CIUDADANO', 'EMPRESAS'];

      if (rolesSinPanelWeb.includes(rolNombre)) {
        return res.status(403).json({
          message: 'Este rol no tiene acceso al panel administrativo',
        });
      }

      // Token: 8h si "Recordarme", 1h por defecto
      const expiresIn = rememberMe ? '8h' : '1h';

      const token = jwt.sign(
        { id: user.id, rol_id: user.rol_id || null, rol: rolNombre, usuario: user.usuario },
        process.env.JWT_SECRET || 'ecoqosqo_web_secret_2026',
        { expiresIn }
      );

      return res.json({
        token,
        expiresIn,
        user: {
          id: user.id,
          usuario: user.usuario,
          rol_id: user.rol_id || null,
          rol: rolNombre,
          rol_descripcion: user.rol_descripcion || null,
        },
      });
    });
  });
};

module.exports = { login };
