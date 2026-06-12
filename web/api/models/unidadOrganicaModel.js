const pool = require('../config/db');

// Listar todas (plano, con nombre del padre)
const findAll = (callback) => {
  const sql = `
    SELECT u.*, p.nombre AS padre_nombre
    FROM unidades_organicas u
    LEFT JOIN unidades_organicas p ON u.padre_id = p.id
    ORDER BY u.nivel, u.orden, u.nombre
  `;
  pool.query(sql, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

// Obtener una por ID
const findById = (id, callback) => {
  const sql = `
    SELECT u.*, p.nombre AS padre_nombre
    FROM unidades_organicas u
    LEFT JOIN unidades_organicas p ON u.padre_id = p.id
    WHERE u.id = ?
    LIMIT 1
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) return callback(err, null);
    if (!results || results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
};

// Crear
const create = (data, callback) => {
  const { nombre, sigla, padre_id, nivel, orden } = data;
  const sql = `
    INSERT INTO unidades_organicas (nombre, sigla, padre_id, nivel, orden)
    VALUES (?, ?, ?, ?, ?)
  `;
  pool.query(sql, [nombre, sigla || '', padre_id || null, nivel || 0, orden || 0], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, { id: result.insertId, ...data });
  });
};

// Actualizar
const update = (id, data, callback) => {
  const { nombre, sigla, padre_id, nivel, orden, activo } = data;
  const sql = `
    UPDATE unidades_organicas SET
      nombre = ?, sigla = ?, padre_id = ?, nivel = ?, orden = ?, activo = ?
    WHERE id = ?
  `;
  const activoVal = activo !== undefined ? (activo ? 1 : 0) : 1;
  pool.query(sql, [nombre, sigla || '', padre_id || null, nivel || 0, orden || 0, activoVal, id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id, ...data });
  });
};

// Eliminar (con transacción para consistencia)
const remove = (id, callback) => {
  pool.getConnection((connErr, conn) => {
    if (connErr) return callback(connErr, null);
    conn.beginTransaction((txErr) => {
      if (txErr) { conn.release(); return callback(txErr, null); }
      conn.query('UPDATE unidades_organicas SET padre_id = NULL WHERE padre_id = ?', [id], (err) => {
        if (err) return conn.rollback(() => { conn.release(); callback(err, null); });
        conn.query('DELETE FROM unidades_organicas WHERE id = ?', [id], (err2, result) => {
          if (err2) return conn.rollback(() => { conn.release(); callback(err2, null); });
          conn.commit((commitErr) => {
            if (commitErr) return conn.rollback(() => { conn.release(); callback(commitErr, null); });
            conn.release();
            if (result.affectedRows === 0) return callback(null, null);
            return callback(null, { id });
          });
        });
      });
    });
  });
};

// Hijos directos de una unidad (o raíces si padreId es null)
const findByParent = (padreId, callback) => {
  let sql;
  let params;
  if (padreId === null || padreId === undefined || padreId === 'null') {
    sql = `SELECT u.*, (SELECT COUNT(*) FROM unidades_organicas WHERE padre_id = u.id) AS hijos_count
           FROM unidades_organicas u WHERE u.padre_id IS NULL ORDER BY u.orden, u.nombre`;
    params = [];
  } else {
    sql = `SELECT u.*, (SELECT COUNT(*) FROM unidades_organicas WHERE padre_id = u.id) AS hijos_count
           FROM unidades_organicas u WHERE u.padre_id = ? ORDER BY u.orden, u.nombre`;
    params = [padreId];
  }
  pool.query(sql, params, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

// Buscar unidades por nombre
const search = (query, callback) => {
  const sql = `SELECT u.*, p.nombre AS padre_nombre
    FROM unidades_organicas u
    LEFT JOIN unidades_organicas p ON u.padre_id = p.id
    WHERE u.nombre LIKE ? OR u.sigla LIKE ?
    ORDER BY u.nivel, u.nombre
    LIMIT 20`;
  const term = `%${query}%`;
  pool.query(sql, [term, term], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

// Obtener el camino (breadcrumb) desde la raíz hasta una unidad
// Con protección contra ciclos y límite de profundidad
const getPath = (id, callback) => {
  const path = [];
  const visited = new Set();
  const MAX_DEPTH = 50;

  const step = (currentId, depth, cb) => {
    if (!currentId) return cb(null, path.reverse());
    if (depth > MAX_DEPTH) return cb(new Error('Profundidad máxima excedida en organigrama'));
    if (visited.has(currentId)) return cb(new Error('Ciclo detectado en organigrama'));
    visited.add(currentId);

    pool.query('SELECT id, nombre, padre_id FROM unidades_organicas WHERE id = ? LIMIT 1', [currentId], (err, results) => {
      if (err) return cb(err);
      if (!results || results.length === 0) return cb(null, path.reverse());
      const unit = results[0];
      path.push({ id: unit.id, nombre: unit.nombre });
      step(unit.padre_id, depth + 1, cb);
    });
  };
  step(id, 0, callback);
};

module.exports = { findAll, findById, findByParent, search, getPath, create, update, remove };
