const mysql = require('mysql2');
require('dotenv').config();

// Pool único compartido por todos los modelos
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
  console.error('Error en pool MySQL:', err.message);
});

module.exports = pool;
