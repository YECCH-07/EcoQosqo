const pool = require('../config/db');

const create = (data, callback) => {
  const { titulo, mensaje, tipo, usuario_id, rol_id } = data;
  const sql = `
    INSERT INTO notificaciones (titulo, mensaje, tipo, usuario_id, rol_id, estado, leido)
    VALUES (?, ?, ?, ?, ?, 'activo', 0)
  `;
  pool.query(sql, [titulo, mensaje, tipo, usuario_id || null, rol_id || null], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, { id: result.insertId, ...data });
  });
};

const findRecentSimilar = (tipo, placa, hours, callback) => {
  const sql = `
    SELECT id FROM notificaciones
    WHERE tipo = ? AND mensaje LIKE ? AND creado_en > DATE_SUB(NOW(), INTERVAL ? HOUR)
    LIMIT 1
  `;
  pool.query(sql, [tipo, `%${placa}%`, hours], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results && results.length > 0);
  });
};

module.exports = { create, findRecentSimilar };
