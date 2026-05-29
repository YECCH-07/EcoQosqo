const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const login = (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
  }

  userModel.findUserByUsername(usuario, (err, user) => {
    if (err) return res.status(500).json({ message: 'Error en la consulta' });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const storedPassword = user.password || '';
    const looksHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

    const onPasswordValidated = (isValid) => {
      if (!isValid) return res.status(400).json({ message: 'Contraseña incorrecta' });

      const rolNombre = (user.rol || '').toUpperCase().trim() || 'SIN_ROL';
      const rolesSinPanelWeb = ['CLIENTE', 'CLIENTE_SELECT'];

      // Este sistema de administración NO permite ingreso de CLIENTE
      if (rolesSinPanelWeb.includes(rolNombre)) {
        return res.status(403).json({
          message: 'Este rol no tiene acceso al panel administrativo',
        });
      }

      const token = jwt.sign(
        { id: user.id, rol_id: user.rol_id || null, rol: rolNombre, usuario: user.usuario },
        process.env.JWT_SECRET || 'secreto',
        { expiresIn: '1h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          usuario: user.usuario,
          rol_id: user.rol_id || null,
          rol: rolNombre,
          rol_descripcion: user.rol_descripcion || null,
        },
      });
    };

    if (looksHashed) {
      bcrypt.compare(password, storedPassword, (compareErr, match) => {
        if (compareErr) return res.status(500).json({ message: 'Error en la comparación de contraseñas' });
        return onPasswordValidated(match);
      });
    } else {
      return onPasswordValidated(password === storedPassword);
    }
  });
};

module.exports = { login };
