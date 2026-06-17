const pool = require('../config/db');

const findByVehiculo = (vehiculoId, callback) => {
  const sql = `
    SELECT m.*, v.placa
    FROM mantenimientos m
    INNER JOIN vehiculos v ON m.vehiculo_id = v.id
    WHERE m.vehiculo_id = ?
    ORDER BY m.fecha_programada DESC
  `;
  pool.query(sql, [vehiculoId], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const findById = (id, callback) => {
  const sql = `
    SELECT m.*, v.placa
    FROM mantenimientos m
    INNER JOIN vehiculos v ON m.vehiculo_id = v.id
    WHERE m.id = ?
    LIMIT 1
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) return callback(err, null);
    if (!results || results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
};

const create = (data, callback) => {
  const {
    vehiculo_id, tipo, descripcion, taller, costo,
    fecha_programada, fecha_realizada, kilometraje_actual, estado, observaciones,
  } = data;
  const sql = `
    INSERT INTO mantenimientos (vehiculo_id, tipo, descripcion, taller, costo,
      fecha_programada, fecha_realizada, kilometraje_actual, estado, observaciones)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    vehiculo_id, tipo || 'preventivo', descripcion.trim(),
    taller || '', costo || 0,
    fecha_programada, fecha_realizada || null,
    kilometraje_actual || 0, estado || 'programado', observaciones || '',
  ];
  pool.query(sql, values, (err, result) => {
    if (err) return callback(err, null);
    return callback(null, { id: result.insertId, ...data });
  });
};

const update = (id, data, callback) => {
  const {
    tipo, descripcion, taller, costo,
    fecha_programada, fecha_realizada, kilometraje_actual, estado, observaciones,
  } = data;
  const sql = `
    UPDATE mantenimientos SET
      tipo = ?, descripcion = ?, taller = ?, costo = ?,
      fecha_programada = ?, fecha_realizada = ?,
      kilometraje_actual = ?, estado = ?, observaciones = ?
    WHERE id = ?
  `;
  const values = [
    tipo || 'preventivo', descripcion.trim(), taller || '', costo || 0,
    fecha_programada, fecha_realizada || null,
    kilometraje_actual || 0, estado || 'programado', observaciones || '',
    id,
  ];
  pool.query(sql, values, (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id, ...data });
  });
};

const remove = (id, callback) => {
  pool.query('DELETE FROM mantenimientos WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id });
  });
};

const findProgramados = (callback) => {
  const sql = `
    SELECT m.*, v.placa, v.marca, v.modelo
    FROM mantenimientos m
    INNER JOIN vehiculos v ON m.vehiculo_id = v.id
    WHERE m.estado IN ('programado', 'en_proceso') AND v.activo = 1
    ORDER BY m.fecha_programada ASC
  `;
  pool.query(sql, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const findVencidos = (callback) => {
  const sql = `
    SELECT m.*, v.placa, v.marca, v.modelo,
      DATEDIFF(CURDATE(), m.fecha_programada) AS dias_vencido
    FROM mantenimientos m
    INNER JOIN vehiculos v ON m.vehiculo_id = v.id
    WHERE m.estado = 'programado'
      AND m.fecha_programada < CURDATE()
      AND v.activo = 1
    ORDER BY m.fecha_programada ASC
  `;
  pool.query(sql, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const findProximos = (days, callback) => {
  const sql = `
    SELECT m.*, v.placa, v.marca, v.modelo,
      DATEDIFF(m.fecha_programada, CURDATE()) AS dias_restantes
    FROM mantenimientos m
    INNER JOIN vehiculos v ON m.vehiculo_id = v.id
    WHERE m.estado IN ('programado', 'en_proceso')
      AND m.fecha_programada BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      AND v.activo = 1
    ORDER BY m.fecha_programada ASC
  `;
  pool.query(sql, [days], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

module.exports = {
  findByVehiculo, findById, create, update, remove,
  findProgramados, findVencidos, findProximos,
};
