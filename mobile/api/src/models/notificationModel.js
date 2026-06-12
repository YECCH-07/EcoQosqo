const { pool } = require('../config/db');

async function listForUser(usuario) {
  const [rows] = await pool.execute(
    `SELECT id, titulo, mensaje, tipo, leido, fecha_lectura, creado_en
     FROM notificaciones
     WHERE estado = 'activo'
       AND (
         usuario_id = ?
         OR (usuario_id IS NULL AND (rol_id = ? OR rol_id IS NULL))
       )
     ORDER BY creado_en DESC
     LIMIT 50`,
    [usuario.id, usuario.rolId || null]
  );

  return rows;
}

async function markAsRead(id, usuario) {
  const [result] = await pool.execute(
    `UPDATE notificaciones
     SET leido = 1, fecha_lectura = NOW()
     WHERE id = ?
       AND estado = 'activo'
       AND (
         usuario_id = ?
         OR (usuario_id IS NULL AND (rol_id = ? OR rol_id IS NULL))
       )`,
    [id, usuario.id, usuario.rolId || null]
  );

  return result.affectedRows > 0;
}

module.exports = {
  listForUser,
  markAsRead
};
