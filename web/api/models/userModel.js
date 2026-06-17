const pool = require('../config/db');

const testConnection = (callback) => {
  pool.query('SELECT 1 AS ok', (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results?.[0] || null);
  });
};

const findUserByUsername = (username, callback) => {
  const query = `
    SELECT
      u.*,
      r.nombre AS rol
    FROM usuarios u
    INNER JOIN roles r ON u.rol_id = r.id
    WHERE u.usuario = ?
    LIMIT 1
  `;
  pool.query(query, [username], (err, results) => {
    if (err) {
      console.error(' Error al buscar usuario en BD:', err.message);
      return callback(err, null);
    }
    if (!results || results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
};

const findAll = (callback) => {
  pool.query(
    'SELECT u.id, u.nombre, u.usuario, u.correo, u.activo, u.rol_id, r.nombre AS rol, u.created_at FROM usuarios u JOIN roles r ON u.rol_id = r.id ORDER BY u.id',
    (err, results) => { if (err) return callback(err, null); return callback(null, results); }
  );
};

const findById = (id, callback) => {
  pool.query(
    'SELECT u.id, u.nombre, u.usuario, u.correo, u.activo, u.rol_id, r.nombre AS rol, u.created_at FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = ? LIMIT 1',
    [id], (err, results) => {
      if (err) return callback(err, null);
      if (!results || results.length === 0) return callback(null, null);
      return callback(null, results[0]);
    }
  );
};

const create = (data, callback) => {
  const { nombre, usuario, correo, password_hash, rol_id } = data;
  pool.query(
    'INSERT INTO usuarios (nombre, usuario, correo, password_hash, rol_id) VALUES (?, ?, ?, ?, ?)',
    [nombre.trim(), usuario.trim(), correo || null, password_hash, rol_id],
    (err, result) => {
      if (err) return callback(err, null);
      return callback(null, { id: result.insertId, ...data });
    }
  );
};

const update = (id, data, callback) => {
  const { nombre, usuario, correo, activo, rol_id } = data;
  pool.query(
    'UPDATE usuarios SET nombre=?, usuario=?, correo=?, activo=?, rol_id=? WHERE id=?',
    [nombre.trim(), usuario.trim(), correo || null, activo !== undefined ? (activo ? 1 : 0) : 1, rol_id, id],
    (err, result) => {
      if (err) return callback(err, null);
      if (result.affectedRows === 0) return callback(null, null);
      return callback(null, { id, ...data });
    }
  );
};

const updatePassword = (id, passwordHash, callback) => {
  pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [passwordHash, id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id });
  });
};

const remove = (id, callback) => {
  pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    if (result.affectedRows === 0) return callback(null, null);
    return callback(null, { id });
  });
};

const countByRole = (callback) => {
  pool.query(
    'SELECT r.nombre AS rol, COUNT(u.id) AS cnt FROM roles r LEFT JOIN usuarios u ON r.id = u.rol_id AND u.activo = 1 GROUP BY r.id ORDER BY r.id',
    (err, results) => { if (err) return callback(err, null); return callback(null, results); }
  );
};

module.exports = { findUserByUsername, testConnection, findAll, findById, create, update, updatePassword, remove, countByRole };
