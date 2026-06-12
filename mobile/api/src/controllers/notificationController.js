const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');

async function list(req, res, next) {
  try {
    const usuario = await userModel.findById(req.usuario.id);
    const notificaciones = await notificationModel.listForUser(usuario || req.usuario);

    return res.json({
      success: true,
      notificaciones
    });
  } catch (error) {
    return next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const usuario = await userModel.findById(req.usuario.id);
    const updated = await notificationModel.markAsRead(req.params.id, usuario || req.usuario);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notificacion no encontrada'
      });
    }

    return res.json({
      success: true,
      message: 'Notificacion marcada como leida'
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  markAsRead
};
