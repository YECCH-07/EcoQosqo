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

async function obtener(req, res, next) {
  try {
    const { pool } = require('../config/db');
    const [rows] = await pool.execute('SELECT * FROM reportes WHERE id = ? AND usuario_id = ?', [req.params.id, req.usuario.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    return res.json({ success: true, reporte: rows[0] });
  } catch (error) { return next(error); }
}

module.exports = {
  create,
  list,
  obtener
};
