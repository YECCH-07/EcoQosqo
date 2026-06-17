const pool = require('../config/db');

const listar = (req, res) => {
  const { estado, prioridad } = req.query;
  let sql = 'SELECT r.*, u.nombre AS ciudadano FROM reportes r LEFT JOIN usuarios u ON r.usuario_id = u.id WHERE 1=1';
  const params = [];
  if (estado && estado !== 'todos') { sql += ' AND r.estado = ?'; params.push(estado); }
  if (prioridad) { sql += ' AND r.prioridad = ?'; params.push(prioridad); }
  sql += ' ORDER BY FIELD(r.prioridad, "alta","media","baja"), r.creado_en DESC LIMIT 100';
  pool.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener reportes' });
    return res.json(results);
  });
};

const obtener = (req, res) => {
  pool.query('SELECT r.*, u.nombre AS ciudadano FROM reportes r LEFT JOIN usuarios u ON r.usuario_id = u.id WHERE r.id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener reporte' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Reporte no encontrado' });
    return res.json(results[0]);
  });
};

const cambiarEstado = (req, res) => {
  const { estado } = req.body;
  if (!['pendiente', 'en_proceso', 'atendido'].includes(estado)) {
    return res.status(400).json({ message: 'Estado no válido. Use: pendiente, en_proceso, atendido' });
  }
  pool.query('UPDATE reportes SET estado = ? WHERE id = ?', [estado, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar estado' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Reporte no encontrado' });
    return res.json({ message: `Estado cambiado a "${estado}"`, estado });
  });
};

const responder = (req, res) => {
  const { respuesta } = req.body;
  if (!respuesta || !respuesta.trim()) return res.status(400).json({ message: 'La respuesta es obligatoria' });

  // Obtener el reporte para saber el usuario_id
  pool.query('SELECT * FROM reportes WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener reporte' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Reporte no encontrado' });

    const reporte = results[0];

    // Actualizar respuesta en el reporte (sin cambiar estado automáticamente)
    pool.query('UPDATE reportes SET respuesta = ? WHERE id = ?',
      [respuesta.trim(), req.params.id], (err2) => {
        if (err2) return res.status(500).json({ message: 'Error al guardar respuesta' });

        // Crear notificación para el ciudadano
        pool.query(
          'INSERT INTO notificaciones (titulo, mensaje, tipo, usuario_id, estado, leido) VALUES (?, ?, ?, ?, "activo", 0)',
          ['Reporte #' + req.params.id + ' atendido', respuesta.trim(), 'info', reporte.usuario_id],
          (err3, notifResult) => {
            if (err3) return res.status(500).json({ message: 'Error al crear notificación' });
            return res.json({
              message: 'Respuesta enviada al ciudadano',
              notificacion_id: notifResult.insertId,
              usuario_id: reporte.usuario_id,
            });
          }
        );
      });
  });
};

module.exports = { listar, obtener, cambiarEstado, responder };
