const rutaModel = require('../models/rutaModel');

async function listar(req, res, next) {
  try {
    const rutas = await rutaModel.findAll();
    return res.json({ success: true, rutas });
  } catch (err) {
    return next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const ruta = await rutaModel.findById(req.params.id);
    if (!ruta) return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
    return res.json({ success: true, ruta });
  } catch (err) {
    return next(err);
  }
}

async function cercana(req, res, next) {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat y lng son requeridos' });
    }
    const resultado = await rutaModel.findNearest(Number(lat), Number(lng));
    if (!resultado) {
      return res.status(404).json({ success: false, message: 'No se encontraron rutas cercanas' });
    }
    return res.json({ success: true, ...resultado });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, obtener, cercana };
