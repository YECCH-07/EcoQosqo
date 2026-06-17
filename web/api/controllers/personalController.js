const personalModel = require('../models/personalModel');
const pool = require('../config/db');

// ─── Tipos de personal ──────────────────────────────

const listarTipos = (req, res) => {
  personalModel.findAllTipos((err, tipos) => {
    if (err) return res.status(500).json({ message: 'Error al obtener tipos de personal' });
    return res.json(tipos);
  });
};

const crearTipo = (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ message: 'El nombre del tipo es obligatorio' });
  }
  personalModel.createTipo(nombre.trim(), (err, tipo) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Este tipo de personal ya existe' });
      }
      return res.status(500).json({ message: 'Error al crear tipo de personal' });
    }
    return res.status(201).json(tipo);
  });
};

// ─── Personal ────────────────────────────────────────

const listar = (req, res) => {
  personalModel.findAll((err, personal) => {
    if (err) return res.status(500).json({ message: 'Error al obtener personal' });
    return res.json(personal);
  });
};

const obtener = (req, res) => {
  const { id } = req.params;
  personalModel.findById(id, (err, persona) => {
    if (err) return res.status(500).json({ message: 'Error al obtener el registro' });
    if (!persona) return res.status(404).json({ message: 'Personal no encontrado' });
    return res.json(persona);
  });
};

const crear = (req, res) => {
  const { nombres, apellidos, dni, telefono, direccion, tipo_id, unidad_organica_id, fecha_contratacion, fecha_fin_contrato, honorarios, estado, regimen_laboral, condicion, nivel, nro_resolucion, correo_institucional } = req.body;

  // Validaciones
  if (!nombres || !nombres.trim()) {
    return res.status(400).json({ message: 'Los nombres son obligatorios' });
  }
  if (!apellidos || !apellidos.trim()) {
    return res.status(400).json({ message: 'Los apellidos son obligatorios' });
  }
  if (!dni || !dni.trim()) {
    return res.status(400).json({ message: 'El DNI es obligatorio' });
  }
  if (dni.length !== 8 || !/^\d{8}$/.test(dni)) {
    return res.status(400).json({ message: 'El DNI debe tener 8 dígitos numéricos' });
  }
  if (!tipo_id) {
    return res.status(400).json({ message: 'El tipo de personal es obligatorio' });
  }
  if (!fecha_contratacion) {
    return res.status(400).json({ message: 'La fecha de contratación es obligatoria' });
  }

  const data = {
    nombres: nombres.trim(), apellidos: apellidos.trim(), dni: dni.trim(),
    telefono: telefono || '', direccion: direccion || '',
    tipo_id, unidad_organica_id: unidad_organica_id || null,
    fecha_contratacion, fecha_fin_contrato: fecha_fin_contrato || null,
    honorarios: isNaN(Number(honorarios)) ? 0 : Number(honorarios),
    estado: estado || 'activo',
    regimen_laboral: regimen_laboral || 'CAS',
    condicion: condicion || 'Contratado CAS',
    nivel: nivel || 'Profesional',
    nro_resolucion: nro_resolucion || '',
    correo_institucional: correo_institucional || '',
  };

  personalModel.create(data, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe una persona con ese DNI' });
      }
      return res.status(500).json({ message: 'Error al crear el registro' });
    }
    return res.status(201).json(result);
  });
};

const actualizar = (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, dni, telefono, direccion, tipo_id, unidad_organica_id, fecha_contratacion, fecha_fin_contrato, honorarios, estado, regimen_laboral, condicion, nivel, nro_resolucion, correo_institucional } = req.body;

  if (!nombres || !nombres.trim() || !apellidos || !apellidos.trim() || !dni || !dni.trim() || !tipo_id || !fecha_contratacion) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  if (dni.trim().length !== 8 || !/^\d{8}$/.test(dni.trim())) {
    return res.status(400).json({ message: 'El DNI debe tener 8 dígitos numéricos' });
  }

  const data = {
    nombres: nombres.trim(), apellidos: apellidos.trim(), dni: dni.trim(),
    telefono: telefono || '', direccion: direccion || '',
    tipo_id, unidad_organica_id: unidad_organica_id || null,
    fecha_contratacion, fecha_fin_contrato: fecha_fin_contrato || null,
    honorarios: isNaN(Number(honorarios)) ? 0 : Number(honorarios),
    estado: estado || 'activo',
    regimen_laboral: regimen_laboral || 'CAS',
    condicion: condicion || 'Contratado CAS',
    nivel: nivel || 'Profesional',
    nro_resolucion: nro_resolucion || '',
    correo_institucional: correo_institucional || '',
  };

  personalModel.update(id, data, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Ya existe otra persona con ese DNI' });
      }
      return res.status(500).json({ message: 'Error al actualizar el registro' });
    }
    if (!result) return res.status(404).json({ message: 'Personal no encontrado' });
    return res.json(result);
  });
};

const eliminar = (req, res) => {
  const { id } = req.params;
  // Verificar que no esté en un equipo activo
  pool.query(
    'SELECT e.nombre AS equipo FROM equipo_personal ep JOIN equipos_trabajo e ON ep.equipo_id = e.id WHERE ep.personal_id = ? AND e.activo = 1 LIMIT 1',
    [id], (errEq, results) => {
      if (errEq) return res.status(500).json({ message: 'Error al verificar equipo' });
      if (results && results.length > 0) {
        return res.status(409).json({ message: `No se puede eliminar: pertenece al equipo activo "${results[0].equipo}". Retírelo del equipo primero.` });
      }
      personalModel.remove(id, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar el registro' });
        if (!result) return res.status(404).json({ message: 'Personal no encontrado' });
        return res.json({ message: 'Personal eliminado correctamente' });
      });
    });
};

const buscar = (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);
  personalModel.search(q.trim(), (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al buscar personal' });
    return res.json(results);
  });
};

module.exports = { listarTipos, crearTipo, listar, obtener, buscar, crear, actualizar, eliminar };
