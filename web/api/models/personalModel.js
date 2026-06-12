const pool = require('../config/db');

// ─── Tipos de personal ──────────────────────────────

const findAllTipos = (callback) => {
  pool.query('SELECT id, nombre FROM tipos_personal ORDER BY nombre', (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const createTipo = (nombre, callback) => {
  pool.query('INSERT INTO tipos_personal (nombre) VALUES (?)', [nombre], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, { id: result.insertId, nombre });
  });
};

// ─── Personal ────────────────────────────────────────

const findAll = (callback) => {
  const sql = `
    SELECT p.*, t.nombre AS tipo_nombre, u.nombre AS unidad_nombre
    FROM personal p
    INNER JOIN tipos_personal t ON p.tipo_id = t.id
    LEFT JOIN unidades_organicas u ON p.unidad_organica_id = u.id
    ORDER BY p.apellidos, p.nombres
  `;
  pool.query(sql, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const findById = (id, callback) => {
  const sql = `
    SELECT p.*, t.nombre AS tipo_nombre, u.nombre AS unidad_nombre
    FROM personal p
    INNER JOIN tipos_personal t ON p.tipo_id = t.id
    LEFT JOIN unidades_organicas u ON p.unidad_organica_id = u.id
    WHERE p.id = ?
    LIMIT 1
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) return callback(err, null);
    if (!results || results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
};

const create = (data, callback) => {
  const { nombres, apellidos, dni, telefono, direccion, tipo_id, unidad_organica_id, fecha_contratacion, fecha_fin_contrato, honorarios, estado, regimen_laboral, condicion, nivel, nro_resolucion, correo_institucional } = data;
  const sql = `
    INSERT INTO personal (nombres, apellidos, dni, telefono, direccion, tipo_id, unidad_organica_id, fecha_contratacion, fecha_fin_contrato, honorarios, estado, regimen_laboral, condicion, nivel, nro_resolucion, correo_institucional)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    nombres, apellidos, dni,
    telefono || '', direccion || '',
    tipo_id, unidad_organica_id || null,
    fecha_contratacion, fecha_fin_contrato || null,
    honorarios || 0, estado || 'activo',
    regimen_laboral || 'CAS', condicion || 'Contratado CAS',
    nivel || 'Profesional', nro_resolucion || '',
    correo_institucional || '',
  ];
  pool.query(sql, values, (err, result) => {
    if (err) return callback(err, null);
    return callback(null, { id: result.insertId, ...data });
  });
};

const update = (id, data, callback) => {
  const { nombres, apellidos, dni, telefono, direccion, tipo_id, unidad_organica_id, fecha_contratacion, fecha_fin_contrato, honorarios, estado, regimen_laboral, condicion, nivel, nro_resolucion, correo_institucional } = data;
  const sql = `
    UPDATE personal SET
      nombres = ?, apellidos = ?, dni = ?, telefono = ?, direccion = ?,
      tipo_id = ?, unidad_organica_id = ?, fecha_contratacion = ?, fecha_fin_contrato = ?,
      honorarios = ?, estado = ?, regimen_laboral = ?, condicion = ?, nivel = ?,
      nro_resolucion = ?, correo_institucional = ?
    WHERE id = ?
  `;
  const values = [
    nombres, apellidos, dni,
    telefono || '', direccion || '',
    tipo_id, unidad_organica_id || null,
    fecha_contratacion, fecha_fin_contrato || null,
    honorarios || 0, estado || 'activo',
    regimen_laboral || 'CAS', condicion || 'Contratado CAS',
    nivel || 'Profesional', nro_resolucion || '',
    correo_institucional || '',
    id,
  ];
  pool.query(sql, values, (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id, ...data });
  });
};

const remove = (id, callback) => {
  pool.query('DELETE FROM personal WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id });
  });
};

const search = (query, callback) => {
  const sql = `
    SELECT p.*, t.nombre AS tipo_nombre, u.nombre AS unidad_nombre
    FROM personal p
    INNER JOIN tipos_personal t ON p.tipo_id = t.id
    LEFT JOIN unidades_organicas u ON p.unidad_organica_id = u.id
    WHERE p.nombres LIKE ? OR p.apellidos LIKE ? OR p.dni LIKE ?
    ORDER BY p.apellidos, p.nombres
    LIMIT 20
  `;
  const term = `%${query}%`;
  pool.query(sql, [term, term, term], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

module.exports = { findAllTipos, createTipo, findAll, findById, search, create, update, remove };
