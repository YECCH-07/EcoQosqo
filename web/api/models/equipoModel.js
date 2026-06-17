const pool = require('../config/db');

const findAll = (callback) => {
  const sql = `
    SELECT e.*, v.placa,
      (SELECT COUNT(*) FROM equipo_personal WHERE equipo_id = e.id) AS personas_count
    FROM equipos_trabajo e
    LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
    WHERE e.activo = 1
    ORDER BY e.nombre
  `;
  pool.query(sql, (err, results) => { if (err) return callback(err, null); return callback(null, results); });
};

const findById = (id, callback) => {
  const sql = `
    SELECT e.*, v.placa
    FROM equipos_trabajo e LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
    WHERE e.id = ? LIMIT 1
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) return callback(err, null);
    if (!results || results.length === 0) return callback(null, null);
    const equipo = results[0];
    // Cargar miembros
    pool.query(
      `SELECT ep.*, CONCAT(p.nombres,' ',p.apellidos) AS nombre_completo, p.dni
       FROM equipo_personal ep JOIN personal p ON ep.personal_id = p.id
       WHERE ep.equipo_id = ?`, [id],
      (err2, miembros) => {
        if (err2) return callback(err2, null);
        return callback(null, { ...equipo, miembros });
      }
    );
  });
};

const create = (data, callback) => {
  const { nombre, tipo, vehiculo_id, miembros } = data;
  pool.getConnection((connErr, conn) => {
    if (connErr) return callback(connErr, null);
    conn.beginTransaction((txErr) => {
      if (txErr) { conn.release(); return callback(txErr, null); }
      conn.query('INSERT INTO equipos_trabajo (nombre, tipo, vehiculo_id) VALUES (?, ?, ?)',
        [nombre.trim(), tipo, vehiculo_id || null], (err, result) => {
          if (err) return conn.rollback(() => { conn.release(); callback(err, null); });
          const equipoId = result.insertId;
          if (!miembros || miembros.length === 0) {
            return conn.commit((ce) => {
              if (ce) return conn.rollback(() => { conn.release(); callback(ce, null); });
              conn.release();
              return callback(null, { id: equipoId, ...data });
            });
          }
          const values = miembros.map(m => [equipoId, m.personal_id, m.rol || 'ayudante']);
          conn.query('INSERT INTO equipo_personal (equipo_id, personal_id, rol) VALUES ?', [values], (err2) => {
            if (err2) return conn.rollback(() => { conn.release(); callback(err2, null); });
            conn.commit((ce) => {
              if (ce) return conn.rollback(() => { conn.release(); callback(ce, null); });
              conn.release();
              return callback(null, { id: equipoId, ...data });
            });
          });
        });
    });
  });
};

const update = (id, data, callback) => {
  const { nombre, tipo, vehiculo_id, miembros } = data;
  pool.getConnection((connErr, conn) => {
    if (connErr) return callback(connErr, null);
    conn.beginTransaction((txErr) => {
      if (txErr) { conn.release(); return callback(txErr, null); }
      conn.query('UPDATE equipos_trabajo SET nombre=?, tipo=?, vehiculo_id=? WHERE id=?',
        [nombre.trim(), tipo, vehiculo_id || null, id], (err) => {
          if (err) return conn.rollback(() => { conn.release(); callback(err, null); });
          conn.query('DELETE FROM equipo_personal WHERE equipo_id = ?', [id], (err2) => {
            if (err2) return conn.rollback(() => { conn.release(); callback(err2, null); });
            if (miembros && miembros.length > 0) {
              const values = miembros.map(m => [id, m.personal_id, m.rol || 'ayudante']);
              conn.query('INSERT INTO equipo_personal (equipo_id, personal_id, rol) VALUES ?', [values], (err3) => {
                if (err3) return conn.rollback(() => { conn.release(); callback(err3, null); });
                conn.commit((ce) => {
                  if (ce) return conn.rollback(() => { conn.release(); callback(ce, null); });
                  conn.release();
                  return callback(null, { id, ...data });
                });
              });
            } else {
              conn.commit((ce) => {
                if (ce) return conn.rollback(() => { conn.release(); callback(ce, null); });
                conn.release();
                return callback(null, { id, ...data });
              });
            }
          });
        });
    });
  });
};

const remove = (id, callback) => {
  pool.query('UPDATE equipos_trabajo SET activo = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id });
  });
};

module.exports = { findAll, findById, create, update, remove };
