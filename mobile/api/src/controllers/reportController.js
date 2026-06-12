const reportModel = require('../models/reportModel');

async function list(req, res, next) {
  try {
    const reportes = await reportModel.listByUser(req.usuario.id);

    return res.json({
      success: true,
      reportes
    });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { titulo, descripcion } = req.body;

    if (!String(titulo || '').trim() || !String(descripcion || '').trim()) {
      return res.status(400).json({
        success: false,
        message: 'Titulo y descripcion son obligatorios'
      });
    }

    const reporte = await reportModel.create(req.usuario.id, req.body);

    return res.status(201).json({
      success: true,
      reporte
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list
};
