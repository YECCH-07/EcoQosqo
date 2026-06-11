const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'software',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.on('error', (err) => {
  console.error(' Error en pool MySQL:', err.message);
});

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

module.exports = { findUserByUsername, testConnection };
