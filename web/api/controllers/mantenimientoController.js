const mantenimientoModel = require('../models/mantenimientoModel');
const notificationModel = require('../models/notificationModel');
const vehiculoModel = require('../models/vehiculoModel');

const TIPOS_VALIDOS = ['preventivo', 'correctivo', 'predictivo'];
const ESTADOS_VALIDOS = ['programado', 'en_proceso', 'completado', 'cancelado'];

const notificarMantenimiento = (mant, placa) => {
  if (mant.estado !== 'programado' && mant.estado !== 'en_proceso') return;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diff = Math.ceil((new Date(mant.fecha_programada) - hoy) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    // Vencido
    notificationModel.findRecentSimilar('mantenimiento_vencido', placa, 24, (err, exists) => {
      if (!err && !exists) {
        notificationModel.create({
          titulo: 'Mantenimiento vencido',
          mensaje: `El mantenimiento del vehiculo ${placa} programado para ${mant.fecha_programada.slice(0, 10)} esta vencido (${Math.abs(diff)} dias).`,
          tipo: 'mantenimiento_vencido',
          rol_id: 3,
        }, () => {});
      }
    });
  } else if (diff <= 7) {
    // Próximo (7 días)
    notificationModel.findRecentSimilar('mantenimiento_programado', placa, 24, (err, exists) => {
      if (!err && !exists) {
        notificationModel.create({
          titulo: 'Mantenimiento programado',
          mensaje: `El vehiculo ${placa} tiene mantenimiento ${mant.tipo} programado para ${mant.fecha_programada.slice(0, 10)} (en ${diff} dias).`,
          tipo: 'mantenimiento_programado',
          rol_id: 3,
        }, () => {});
      }
    });
  }
};

const listarPorVehiculo = (req, res) => {
  const { vehiculoId } = req.params;
  mantenimientoModel.findByVehiculo(vehiculoId, (err, mantenimientos) => {
    if (err) return res.status(500).json({ message: 'Error al obtener mantenimientos' });
    return res.json(mantenimientos);
  });
};

const obtener = (req, res) => {
  const { id } = req.params;
  mantenimientoModel.findById(id, (err, mant) => {
    if (err) return res.status(500).json({ message: 'Error al obtener el mantenimiento' });
    if (!mant) return res.status(404).json({ message: 'Mantenimiento no encontrado' });
    return res.json(mant);
  });
};

const crear = (req, res) => {
  const { vehiculoId } = req.params;
  const {
    tipo, descripcion, taller, costo,
    fecha_programada, fecha_realizada, kilometraje_actual, estado, observaciones,
  } = req.body;

  const vehiculoIdNum = Number(vehiculoId);
  if (!vehiculoId || isNaN(vehiculoIdNum) || vehiculoIdNum <= 0) {
    return res.status(400).json({ message: 'El ID del vehiculo no es valido' });
  }

  if (!descripcion || !descripcion.trim()) {
    return res.status(400).json({ message: 'La descripcion es obligatoria' });
  }
  if (!fecha_programada) {
    return res.status(400).json({ message: 'La fecha programada es obligatoria' });
  }
  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ message: 'El tipo de mantenimiento no es valido' });
  }

  const data = {
    vehiculo_id: Number(vehiculoId),
    tipo: TIPOS_VALIDOS.includes(tipo) ? tipo : 'preventivo',
    descripcion: descripcion.trim(),
    taller: taller || '',
    costo: isNaN(Number(costo)) ? 0 : Number(costo),
    fecha_programada,
    fecha_realizada: fecha_realizada || null,
    kilometraje_actual: isNaN(Number(kilometraje_actual)) ? 0 : Number(kilometraje_actual),
    estado: ESTADOS_VALIDOS.includes(estado) ? estado : 'programado',
    observaciones: observaciones || '',
  };

  mantenimientoModel.create(data, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al crear el mantenimiento' });
    // Notificar si está programado y próximo
    vehiculoModel.findById(vehiculoId, (errV, vehiculo) => {
      if (!errV && vehiculo) {
        notificarMantenimiento(data, vehiculo.placa);
      }
    });
    return res.status(201).json(result);
  });
};

const actualizar = (req, res) => {
  const { id } = req.params;
  const {
    tipo, descripcion, taller, costo,
    fecha_programada, fecha_realizada, kilometraje_actual, estado, observaciones,
  } = req.body;

  if (!descripcion || !descripcion.trim() || !fecha_programada) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const data = {
    tipo: TIPOS_VALIDOS.includes(tipo) ? tipo : 'preventivo',
    descripcion: descripcion.trim(),
    taller: taller || '',
    costo: isNaN(Number(costo)) ? 0 : Number(costo),
    fecha_programada,
    fecha_realizada: fecha_realizada || null,
    kilometraje_actual: isNaN(Number(kilometraje_actual)) ? 0 : Number(kilometraje_actual),
    estado: ESTADOS_VALIDOS.includes(estado) ? estado : 'programado',
    observaciones: observaciones || '',
  };

  mantenimientoModel.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar el mantenimiento' });
    if (!result) return res.status(404).json({ message: 'Mantenimiento no encontrado' });
    return res.json(result);
  });
};

const eliminar = (req, res) => {
  const { id } = req.params;
  mantenimientoModel.remove(id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar el mantenimiento' });
    if (!result) return res.status(404).json({ message: 'Mantenimiento no encontrado' });
    return res.json({ message: 'Mantenimiento eliminado correctamente' });
  });
};

const listarProgramados = (req, res) => {
  mantenimientoModel.findProgramados((err, mantenimientos) => {
    if (err) return res.status(500).json({ message: 'Error al obtener mantenimientos programados' });
    return res.json(mantenimientos);
  });
};

module.exports = {
  listarPorVehiculo, obtener, crear, actualizar, eliminar,
  listarProgramados,
};
