const mysql = require('mysql2/promise');
const { db } = require('./env');

const pool = mysql.createPool(db);

async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
}

module.exports = {
  pool,
  testConnection
};
