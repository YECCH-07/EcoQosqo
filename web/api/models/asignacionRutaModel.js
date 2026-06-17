const pool = require('../config/db');

const findAll = (callback) => {
  const sql = `
    SELECT a.*,
      r.nombre AS ruta_nombre,
      e.nombre AS equipo_nombre,
      v.placa AS vehiculo_placa,
      TRIM(CONCAT(COALESCE(c.nombres,''), ' ', COALESCE(c.apellidos,''))) AS conductor_nombre,
      TRIM(CONCAT(COALESCE(ay.nombres,''), ' ', COALESCE(ay.apellidos,''))) AS ayudante_nombre
    FROM asignaciones_ruta a
    JOIN rutas r ON a.ruta_id = r.id
    LEFT JOIN equipos_trabajo e ON a.equipo_id = e.id
    LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
    LEFT JOIN personal c ON a.conductor_id = c.id
    LEFT JOIN personal ay ON a.ayudante_id = ay.id
    WHERE a.activo = 1
    ORDER BY a.fecha DESC, a.turno
  `;
  pool.query(sql, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const findById = (id, callback) => {
  const sql = `
    SELECT a.*,
      r.nombre AS ruta_nombre,
      e.nombre AS equipo_nombre,
      v.placa AS vehiculo_placa,
      TRIM(CONCAT(COALESCE(c.nombres,''), ' ', COALESCE(c.apellidos,''))) AS conductor_nombre,
      TRIM(CONCAT(COALESCE(ay.nombres,''), ' ', COALESCE(ay.apellidos,''))) AS ayudante_nombre
    FROM asignaciones_ruta a
    JOIN rutas r ON a.ruta_id = r.id
    LEFT JOIN equipos_trabajo e ON a.equipo_id = e.id
    LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
    LEFT JOIN personal c ON a.conductor_id = c.id
    LEFT JOIN personal ay ON a.ayudante_id = ay.id
    WHERE a.id = ?
    LIMIT 1
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) return callback(err, null);
    if (!results || results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
};

const create = (data, callback) => {
  const { ruta_id, equipo_id, vehiculo_id, conductor_id, ayudante_id, fecha, turno } = data;
  const sql = `
    INSERT INTO asignaciones_ruta (ruta_id, equipo_id, vehiculo_id, conductor_id, ayudante_id, fecha, turno)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  pool.query(sql, [
    ruta_id, equipo_id || null,
    vehiculo_id || null,
    conductor_id || null, ayudante_id || null,
    fecha, turno || 'mañana',
  ], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, { id: result.insertId, ...data });
  });
};

const update = (id, data, callback) => {
  const { ruta_id, equipo_id, vehiculo_id, conductor_id, ayudante_id, fecha, turno } = data;
  const sql = `
    UPDATE asignaciones_ruta SET
      ruta_id = ?, equipo_id = ?, vehiculo_id = ?, conductor_id = ?, ayudante_id = ?,
      fecha = ?, turno = ?
    WHERE id = ?
  `;
  pool.query(sql, [
    ruta_id, equipo_id || null,
    vehiculo_id || null,
    conductor_id || null, ayudante_id || null,
    fecha, turno || 'mañana', id,
  ], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id, ...data });
  });
};

const remove = (id, callback) => {
  pool.query('UPDATE asignaciones_ruta SET activo = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id });
  });
};

module.exports = { findAll, findById, create, update, remove };
