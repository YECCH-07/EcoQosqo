const pool = require('../config/db');

const findAll = (callback) => {
  const sql = `
    SELECT r.*, COUNT(pr.id) AS puntos_count
    FROM rutas r
    LEFT JOIN puntos_ruta pr ON r.id = pr.ruta_id
    WHERE r.activo = 1
    GROUP BY r.id
    ORDER BY r.nombre
  `;
  pool.query(sql, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const findById = (id, callback) => {
  const sql = `SELECT * FROM rutas WHERE id = ? LIMIT 1`;
  pool.query(sql, [id], (err, results) => {
    if (err) return callback(err, null);
    if (!results || results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
};

const create = (data, callback) => {
  const { nombre, tipo, zona, dias, horario_inicio, horario_fin, color, descripcion } = data;
  const sql = `
    INSERT INTO rutas (nombre, tipo, zona, dias, horario_inicio, horario_fin, color, descripcion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  pool.query(sql, [
    nombre.trim(), tipo || 'recoleccion', zona.trim(),
    dias || 'Lunes a Sábado',
    horario_inicio || '06:00:00', horario_fin || '14:00:00',
    color || '#4a001f', descripcion || '',
  ], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, { id: result.insertId, ...data });
  });
};

const update = (id, data, callback) => {
  const { nombre, tipo, zona, dias, horario_inicio, horario_fin, color, descripcion } = data;
  const sql = `
    UPDATE rutas SET
      nombre = ?, tipo = ?, zona = ?, dias = ?, horario_inicio = ?, horario_fin = ?,
      color = ?, descripcion = ?
    WHERE id = ?
  `;
  pool.query(sql, [
    nombre.trim(), tipo || 'recoleccion', zona.trim(),
    dias || 'Lunes a Sábado',
    horario_inicio || '06:00:00', horario_fin || '14:00:00',
    color || '#4a001f', descripcion || '', id,
  ], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id, ...data });
  });
};

const remove = (id, callback) => {
  pool.query('UPDATE rutas SET activo = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id });
  });
};

const getPuntos = (rutaId, callback) => {
  pool.query(
    'SELECT id, latitud, longitud, orden, tipo, nombre, direccion, tiempo_estimado FROM puntos_ruta WHERE ruta_id = ? ORDER BY orden',
    [rutaId],
    (err, results) => {
      if (err) return callback(err, null);
      return callback(null, results);
    }
  );
};

const savePuntos = (rutaId, puntos, callback) => {
  pool.getConnection((connErr, conn) => {
    if (connErr) return callback(connErr, null);
    conn.beginTransaction((txErr) => {
      if (txErr) { conn.release(); return callback(txErr, null); }
      conn.query('DELETE FROM puntos_ruta WHERE ruta_id = ?', [rutaId], (err) => {
        if (err) return conn.rollback(() => { conn.release(); callback(err, null); });
        if (!puntos || puntos.length === 0) {
          return conn.commit((commitErr) => {
            if (commitErr) return conn.rollback(() => { conn.release(); callback(commitErr, null); });
            conn.release();
            return callback(null, []);
          });
        }
        const values = puntos.map(p => [
          rutaId, Number(p.latitud), Number(p.longitud), Number(p.orden),
          p.tipo || 'parada', p.nombre || '', p.direccion || '',
          Number(p.tiempo_estimado) || 5,
        ]);
        conn.query(
          'INSERT INTO puntos_ruta (ruta_id, latitud, longitud, orden, tipo, nombre, direccion, tiempo_estimado) VALUES ?',
          [values],
          (err2) => {
            if (err2) return conn.rollback(() => { conn.release(); callback(err2, null); });
            conn.commit((commitErr) => {
              if (commitErr) return conn.rollback(() => { conn.release(); callback(commitErr, null); });
              conn.release();
              return callback(null, { ruta_id: rutaId, puntos: puntos.length });
            });
          }
        );
      });
    });
  });
};

module.exports = { findAll, findById, create, update, remove, getPuntos, savePuntos };
