const userModel = require('../models/userModel');

function toPublicUser(usuario) {
  if (!usuario) return usuario;

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    activo: usuario.activo,
    rolId: usuario.rolId,
    rol: usuario.rol
  };
}

async function me(req, res, next) {
  try {
    const usuario = await userModel.findById(req.usuario.id);

    return res.json({
      success: true,
      usuario: toPublicUser(usuario) || req.usuario
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  me
};
