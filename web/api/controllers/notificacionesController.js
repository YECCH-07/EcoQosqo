const pool = require('../config/db');

const listar = (req, res) => {
  const { tipo } = req.query;
  let sql = 'SELECT * FROM notificaciones WHERE estado = "activo"';
  const params = [];
  if (tipo) { sql += ' AND tipo = ?'; params.push(tipo); }
  sql += ' ORDER BY creado_en DESC LIMIT 100';
  pool.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener notificaciones' });
    return res.json(results);
  });
};

const crear = (req, res) => {
  const { titulo, mensaje, tipo, usuario_id, rol_id } = req.body;
  if (!titulo || !titulo.trim()) return res.status(400).json({ message: 'El título es obligatorio' });
  if (!mensaje || !mensaje.trim()) return res.status(400).json({ message: 'El mensaje es obligatorio' });

  pool.query(
    'INSERT INTO notificaciones (titulo, mensaje, tipo, usuario_id, rol_id, estado, leido) VALUES (?, ?, ?, ?, ?, "activo", 0)',
    [titulo.trim(), mensaje.trim(), tipo || 'general', usuario_id || null, rol_id || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al crear notificación' });
      return res.status(201).json({ id: result.insertId, titulo, mensaje, tipo: tipo || 'general' });
    }
  );
};

module.exports = { listar, crear };
