const equipoModel = require('../models/equipoModel');

const listar = (req, res) => {
  equipoModel.findAll((err, equipos) => {
    if (err) return res.status(500).json({ message: 'Error al obtener equipos' });
    return res.json(equipos);
  });
};

const obtener = (req, res) => {
  equipoModel.findById(req.params.id, (err, equipo) => {
    if (err) return res.status(500).json({ message: 'Error al obtener equipo' });
    if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
    return res.json(equipo);
  });
};

const pool = require('../config/db');

const crear = (req, res) => {
  const { nombre, tipo, vehiculo_id, miembros } = req.body;
  if (!nombre || !nombre.trim()) return res.status(400).json({ message: 'El nombre es obligatorio' });
  if (!tipo || !['recoleccion','barrido'].includes(tipo)) return res.status(400).json({ message: 'Tipo no válido' });

  const miembrosArray = Array.isArray(miembros) ? miembros.filter(m => m.personal_id) : [];

  // Validar: vehículo no puede estar en otro equipo activo del mismo tipo, y debe estar operativo
  const checkVehiculo = (cb) => {
    if (!vehiculo_id) return cb(null);
    pool.query('SELECT v.estado, e.nombre AS equipo FROM vehiculos v LEFT JOIN equipos_trabajo e ON e.vehiculo_id = v.id AND e.activo = 1 AND e.tipo = ? AND e.id != ? WHERE v.id = ? LIMIT 1',
      [tipo, 0, vehiculo_id], (err, results) => {
        if (err) return cb(err);
        if (!results || results.length === 0) return cb(new Error('Vehículo no encontrado'));
        if (results[0].estado !== 'operativo') return cb(new Error(`El vehículo no está operativo (estado: ${results[0].estado}). Solo vehículos operativos pueden asignarse.`));
        if (results[0].equipo) return cb(new Error(`El vehículo ya está asignado al equipo "${results[0].equipo}"`));
        return cb(null);
      });
  };

  // Validar: personal no puede estar en otro equipo activo del mismo tipo
  const checkPersonal = (cb) => {
    if (miembrosArray.length === 0) return cb(null);
    const ids = miembrosArray.map(m => m.personal_id);
    pool.query(
      `SELECT ep.personal_id, CONCAT(p.nombres,' ',p.apellidos) AS nombre, e.nombre AS equipo
       FROM equipo_personal ep JOIN equipos_trabajo e ON ep.equipo_id = e.id JOIN personal p ON ep.personal_id = p.id
       WHERE ep.personal_id IN (?) AND e.activo = 1 AND e.tipo = ? LIMIT 1`,
      [ids, tipo], (err, results) => {
        if (err) return cb(err);
        if (results && results.length > 0) return cb(new Error(`La persona "${results[0].nombre}" ya está en el equipo "${results[0].equipo}"`));
        return cb(null);
      });
  };

  checkVehiculo((errVeh) => {
    if (errVeh) return res.status(409).json({ message: errVeh.message });
    checkPersonal((errPer) => {
      if (errPer) return res.status(409).json({ message: errPer.message });

      equipoModel.create({
        nombre: nombre.trim(), tipo,
        vehiculo_id: vehiculo_id || null,
        miembros: miembrosArray,
      }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al crear equipo' });
        return res.status(201).json(result);
      });
    });
  });
};

const actualizar = (req, res) => {
  const { nombre, tipo, vehiculo_id, miembros } = req.body;
  if (!nombre || !nombre.trim()) return res.status(400).json({ message: 'El nombre es obligatorio' });

  const equipoId = Number(req.params.id);
  const miembrosArray = Array.isArray(miembros) ? miembros.filter(m => m.personal_id) : [];
  const tipoEq = tipo || 'recoleccion';

  // Validar: vehículo no puede estar en otro equipo activo del mismo tipo, y debe estar operativo
  const checkVehiculo = (cb) => {
    if (!vehiculo_id) return cb(null);
    pool.query('SELECT v.estado, e.nombre AS equipo FROM vehiculos v LEFT JOIN equipos_trabajo e ON e.vehiculo_id = v.id AND e.activo = 1 AND e.tipo = ? AND e.id != ? WHERE v.id = ? LIMIT 1',
      [tipoEq, equipoId, vehiculo_id], (err, results) => {
        if (err) return cb(err);
        if (!results || results.length === 0) return cb(new Error('Vehículo no encontrado'));
        if (results[0].estado !== 'operativo') return cb(new Error(`El vehículo no está operativo (estado: ${results[0].estado}). Solo vehículos operativos pueden asignarse.`));
        if (results[0].equipo) return cb(new Error(`El vehículo ya está asignado al equipo "${results[0].equipo}"`));
        return cb(null);
      });
  };

  // Validar: personal no puede estar en otro equipo activo del mismo tipo
  const checkPersonal = (cb) => {
    if (miembrosArray.length === 0) return cb(null);
    const ids = miembrosArray.map(m => m.personal_id);
    pool.query(
      `SELECT ep.personal_id, CONCAT(p.nombres,' ',p.apellidos) AS nombre, e.nombre AS equipo
       FROM equipo_personal ep JOIN equipos_trabajo e ON ep.equipo_id = e.id JOIN personal p ON ep.personal_id = p.id
       WHERE ep.personal_id IN (?) AND e.activo = 1 AND e.tipo = ? AND e.id != ? LIMIT 1`,
      [ids, tipoEq, equipoId], (err, results) => {
        if (err) return cb(err);
        if (results && results.length > 0) return cb(new Error(`La persona "${results[0].nombre}" ya está en el equipo "${results[0].equipo}"`));
        return cb(null);
      });
  };

  checkVehiculo((errVeh) => {
    if (errVeh) return res.status(409).json({ message: errVeh.message });
    checkPersonal((errPer) => {
      if (errPer) return res.status(409).json({ message: errPer.message });

      equipoModel.update(equipoId, {
        nombre: nombre.trim(), tipo: tipoEq,
        vehiculo_id: vehiculo_id || null,
        miembros: miembrosArray,
      }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar equipo' });
        if (!result) return res.status(404).json({ message: 'Equipo no encontrado' });
        return res.json(result);
      });
    });
  });
};

const eliminar = (req, res) => {
  equipoModel.remove(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar equipo' });
    if (!result) return res.status(404).json({ message: 'Equipo no encontrado' });
    return res.json({ message: 'Equipo eliminado correctamente' });
  });
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
