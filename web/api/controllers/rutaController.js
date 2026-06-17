const rutaModel = require('../models/rutaModel');

const TIPOS_RUTA = ['recoleccion', 'barrido'];

const listar = (req, res) => {
  rutaModel.findAll((err, rutas) => {
    if (err) return res.status(500).json({ message: 'Error al obtener rutas' });
    return res.json(rutas);
  });
};

const obtener = (req, res) => {
  rutaModel.findById(req.params.id, (err, ruta) => {
    if (err) return res.status(500).json({ message: 'Error al obtener la ruta' });
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });
    rutaModel.getPuntos(ruta.id, (err2, puntos) => {
      if (err2) return res.status(500).json({ message: 'Error al obtener puntos' });
      return res.json({ ...ruta, puntos });
    });
  });
};

const crear = (req, res) => {
  const { nombre, tipo, zona, dias, horario_inicio, horario_fin, color, descripcion } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ message: 'El nombre de la ruta es obligatorio' });
  }
  if (!zona || !zona.trim()) {
    return res.status(400).json({ message: 'La zona es obligatoria' });
  }
  const data = {
    nombre: nombre.trim(),
    tipo: TIPOS_RUTA.includes(tipo) ? tipo : 'recoleccion',
    zona: zona.trim(),
    dias: dias || 'Lunes a Sábado',
    horario_inicio: horario_inicio || '06:00:00',
    horario_fin: horario_fin || '14:00:00',
    color: color || '#4a001f',
    descripcion: descripcion || '',
  };
  rutaModel.create(data, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe una ruta con ese nombre' });
      }
      return res.status(500).json({ message: 'Error al crear la ruta' });
    }
    return res.status(201).json(result);
  });
};

const actualizar = (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, zona, dias, horario_inicio, horario_fin, color, descripcion } = req.body;
  if (!nombre || !nombre.trim() || !zona || !zona.trim()) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }
  const data = {
    nombre: nombre.trim(),
    tipo: TIPOS_RUTA.includes(tipo) ? tipo : 'recoleccion',
    zona: zona.trim(),
    dias: dias || 'Lunes a Sábado',
    horario_inicio: horario_inicio || '06:00:00',
    horario_fin: horario_fin || '14:00:00',
    color: color || '#4a001f',
    descripcion: descripcion || '',
  };
  rutaModel.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar la ruta' });
    if (!result) return res.status(404).json({ message: 'Ruta no encontrada' });
    return res.json(result);
  });
};

const eliminar = (req, res) => {
  const pool = require('../config/db');
  // Verificar que no tenga asignaciones activas
  pool.query('SELECT a.id, e.nombre AS equipo FROM asignaciones_ruta a JOIN equipos_trabajo e ON a.equipo_id = e.id WHERE a.ruta_id = ? AND a.activo = 1 LIMIT 1',
    [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Error al verificar asignaciones' });
      if (results && results.length > 0) {
        return res.status(409).json({ message: `No se puede eliminar: la ruta está asignada al equipo "${results[0].equipo}". Desasigne primero.` });
      }
      rutaModel.remove(req.params.id, (err2, result) => {
        if (err2) return res.status(500).json({ message: 'Error al eliminar la ruta' });
        if (!result) return res.status(404).json({ message: 'Ruta no encontrada' });
        return res.json({ message: 'Ruta eliminada correctamente' });
      });
    });
};

const obtenerPuntos = (req, res) => {
  rutaModel.getPuntos(req.params.id, (err, puntos) => {
    if (err) return res.status(500).json({ message: 'Error al obtener puntos' });
    return res.json(puntos);
  });
};

const guardarPuntos = (req, res) => {
  const { id } = req.params;
  const { puntos } = req.body;
  if (!Array.isArray(puntos)) {
    return res.status(400).json({ message: 'Se requiere un array de puntos' });
  }
  rutaModel.findById(id, (err, ruta) => {
    if (err) return res.status(500).json({ message: 'Error al verificar ruta' });
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });
    rutaModel.savePuntos(id, puntos, (err2, result) => {
      if (err2) return res.status(500).json({ message: 'Error al guardar puntos' });
      return res.json(result);
    });
  });
};

module.exports = { listar, obtener, crear, actualizar, eliminar, obtenerPuntos, guardarPuntos };
