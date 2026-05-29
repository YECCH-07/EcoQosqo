const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig, allowedRole } = require('../config/env');
const userModel = require('../models/userModel');

function signToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase();
}

async function verifyPassword(inputPassword, storedPassword) {
  const looksLikeBcrypt = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

  if (looksLikeBcrypt) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  return inputPassword === storedPassword;
}

async function login(req, res, next) {
  try {
    const { correo, email, password, contrasena } = req.body;
    const userEmail = correo || email;
    const userPassword = password || contrasena;

    if (!userEmail || !userPassword) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son obligatorios'
      });
    }

    const usuario = await userModel.findByEmail(userEmail);

    if (!usuario || !usuario.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (!userModel.isActive(usuario.activo)) {
      return res.status(403).json({
        success: false,
        message: 'El usuario no se encuentra activo'
      });
    }

    const passwordOk = await verifyPassword(userPassword, usuario.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (normalizeRole(usuario.rol) !== normalizeRole(allowedRole)) {
      return res.status(403).json({
        success: false,
        message: 'Este usuario no tiene acceso al aplicativo móvil'
      });
    }

    const token = signToken(usuario);

    return res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login
};
