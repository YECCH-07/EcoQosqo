const { pool } = require('../config/db');

async function listByUser(usuarioId) {
  const [rows] = await pool.execute(
    `SELECT id, titulo, descripcion, categoria, ubicacion, prioridad, estado,
            respuesta, creado_en, actualizado_en
     FROM reportes
     WHERE usuario_id = ?
     ORDER BY creado_en DESC
     LIMIT 50`,
    [usuarioId]
  );

  return rows;
}

async function create(usuarioId, data) {
  const titulo = String(data.titulo || '').trim();
  const descripcion = String(data.descripcion || '').trim();
  const categoria = String(data.categoria || 'general').trim() || 'general';
  const ubicacion = String(data.ubicacion || '').trim() || null;
  const prioridad = ['baja', 'media', 'alta'].includes(data.prioridad) ? data.prioridad : 'media';

  const foto_url = String(data.foto_url || '').trim() || null;
  const lat = data.lat ? Number(data.lat) : null;
  const lng = data.lng ? Number(data.lng) : null;

  const [result] = await pool.execute(
    `INSERT INTO reportes (usuario_id, titulo, descripcion, categoria, ubicacion, prioridad, foto_url, lat, lng)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [usuarioId, titulo, descripcion, categoria, ubicacion, prioridad, foto_url, lat, lng]
  );

  return {
    id: result.insertId,
    titulo,
    descripcion,
    categoria,
    ubicacion,
    prioridad,
    foto_url,
    lat,
    lng,
    estado: 'pendiente'
  };
}

module.exports = {
  create,
  listByUser
};
