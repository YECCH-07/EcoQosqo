const pool = require('../config/db');

const findAll = (callback) => {
  const sql = `
    SELECT v.*, u.nombre AS unidad_nombre,
      CONCAT(COALESCE(p.nombres,''), ' ', COALESCE(p.apellidos,'')) AS responsable_nombre
    FROM vehiculos v
    LEFT JOIN unidades_organicas u ON v.unidad_organica_id = u.id
    LEFT JOIN personal p ON v.responsable_id = p.id
    WHERE v.activo = 1
    ORDER BY v.placa
  `;
  pool.query(sql, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const findById = (id, callback) => {
  const sql = `
    SELECT v.*, u.nombre AS unidad_nombre,
      CONCAT(COALESCE(p.nombres,''), ' ', COALESCE(p.apellidos,'')) AS responsable_nombre
    FROM vehiculos v
    LEFT JOIN unidades_organicas u ON v.unidad_organica_id = u.id
    LEFT JOIN personal p ON v.responsable_id = p.id
    WHERE v.id = ?
    LIMIT 1
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) return callback(err, null);
    if (!results || results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
};

const findByUnidad = (unidadId, callback) => {
  const sql = `
    SELECT v.*, u.nombre AS unidad_nombre,
      CONCAT(COALESCE(p.nombres,''), ' ', COALESCE(p.apellidos,'')) AS responsable_nombre
    FROM vehiculos v
    LEFT JOIN unidades_organicas u ON v.unidad_organica_id = u.id
    LEFT JOIN personal p ON v.responsable_id = p.id
    WHERE v.unidad_organica_id = ? AND v.activo = 1
    ORDER BY v.placa
  `;
  pool.query(sql, [unidadId], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const search = (query, callback) => {
  const sql = `
    SELECT v.*, u.nombre AS unidad_nombre,
      CONCAT(COALESCE(p.nombres,''), ' ', COALESCE(p.apellidos,'')) AS responsable_nombre
    FROM vehiculos v
    LEFT JOIN unidades_organicas u ON v.unidad_organica_id = u.id
    LEFT JOIN personal p ON v.responsable_id = p.id
    WHERE v.activo = 1
      AND (v.placa LIKE ? OR v.marca LIKE ? OR v.modelo LIKE ? OR v.nro_motor LIKE ?)
    ORDER BY v.placa
    LIMIT 20
  `;
  const term = `%${query}%`;
  pool.query(sql, [term, term, term, term], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const create = (data, callback) => {
  const {
    placa, tipo, marca, modelo, anio, color, nro_motor, nro_chasis,
    capacidad, tipo_combustible, unidad_organica_id, responsable_id,
    estado, kilometraje_actual, fecha_adquisicion, observaciones,
    nro_soat, vigencia_soat, aseguradora_soat,
    nro_revision_tecnica, vigencia_revision_tecnica,
  } = data;
  const sql = `
    INSERT INTO vehiculos (placa, tipo, marca, modelo, anio, color, nro_motor, nro_chasis,
      capacidad, tipo_combustible, unidad_organica_id, responsable_id,
      estado, kilometraje_actual, fecha_adquisicion, observaciones,
      nro_soat, vigencia_soat, aseguradora_soat,
      nro_revision_tecnica, vigencia_revision_tecnica)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    placa.toUpperCase().trim(), tipo, marca.trim(), modelo.trim(), anio,
    color || '', nro_motor || '', nro_chasis || '',
    capacidad || 0, tipo_combustible, unidad_organica_id || null, responsable_id || null,
    estado || 'operativo', kilometraje_actual || 0,
    fecha_adquisicion || null, observaciones || '',
    nro_soat || '', vigencia_soat || null, aseguradora_soat || '',
    nro_revision_tecnica || '', vigencia_revision_tecnica || null,
  ];
  pool.query(sql, values, (err, result) => {
    if (err) return callback(err, null);
    return callback(null, { id: result.insertId, ...data });
  });
};

const update = (id, data, callback) => {
  const {
    placa, tipo, marca, modelo, anio, color, nro_motor, nro_chasis,
    capacidad, tipo_combustible, unidad_organica_id, responsable_id,
    estado, kilometraje_actual, fecha_adquisicion, observaciones,
    nro_soat, vigencia_soat, aseguradora_soat,
    nro_revision_tecnica, vigencia_revision_tecnica,
  } = data;
  const sql = `
    UPDATE vehiculos SET
      placa = ?, tipo = ?, marca = ?, modelo = ?, anio = ?,
      color = ?, nro_motor = ?, nro_chasis = ?,
      capacidad = ?, tipo_combustible = ?, unidad_organica_id = ?, responsable_id = ?,
      estado = ?, kilometraje_actual = ?, fecha_adquisicion = ?, observaciones = ?,
      nro_soat = ?, vigencia_soat = ?, aseguradora_soat = ?,
      nro_revision_tecnica = ?, vigencia_revision_tecnica = ?
    WHERE id = ?
  `;
  const values = [
    placa.toUpperCase().trim(), tipo, marca.trim(), modelo.trim(), anio,
    color || '', nro_motor || '', nro_chasis || '',
    capacidad || 0, tipo_combustible, unidad_organica_id || null, responsable_id || null,
    estado || 'operativo', kilometraje_actual || 0,
    fecha_adquisicion || null, observaciones || '',
    nro_soat || '', vigencia_soat || null, aseguradora_soat || '',
    nro_revision_tecnica || '', vigencia_revision_tecnica || null,
    id,
  ];
  pool.query(sql, values, (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id, ...data });
  });
};

const remove = (id, callback) => {
  pool.query('UPDATE vehiculos SET activo = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id });
  });
};

const findExpiringSOAT = (days, callback) => {
  const sql = `
    SELECT v.*, u.nombre AS unidad_nombre,
      DATEDIFF(v.vigencia_soat, CURDATE()) AS dias_restantes
    FROM vehiculos v
    LEFT JOIN unidades_organicas u ON v.unidad_organica_id = u.id
    WHERE v.activo = 1
      AND v.vigencia_soat IS NOT NULL
      AND v.vigencia_soat <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
    ORDER BY v.vigencia_soat ASC
  `;
  pool.query(sql, [days], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const findExpiringRevision = (days, callback) => {
  const sql = `
    SELECT v.*, u.nombre AS unidad_nombre,
      DATEDIFF(v.vigencia_revision_tecnica, CURDATE()) AS dias_restantes
    FROM vehiculos v
    LEFT JOIN unidades_organicas u ON v.unidad_organica_id = u.id
    WHERE v.activo = 1
      AND v.vigencia_revision_tecnica IS NOT NULL
      AND v.vigencia_revision_tecnica <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
    ORDER BY v.vigencia_revision_tecnica ASC
  `;
  pool.query(sql, [days], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const countByEstado = (callback) => {
  pool.query(
    'SELECT estado, COUNT(*) AS cantidad FROM vehiculos WHERE activo = 1 GROUP BY estado',
    (err, results) => {
      if (err) return callback(err, null);
      return callback(null, results);
    }
  );
};

module.exports = {
  findAll, findById, findByUnidad, search,
  create, update, remove,
  findExpiringSOAT, findExpiringRevision,
  countByEstado,
};
