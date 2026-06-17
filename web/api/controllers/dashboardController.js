const pool = require('../config/db');

const resumen = (req, res) => {
  const queries = {
    vehiculos: 'SELECT estado, COUNT(*) AS cnt FROM vehiculos WHERE activo = 1 GROUP BY estado',
    personal: 'SELECT COUNT(*) AS total FROM personal',
    rutas: "SELECT COUNT(*) AS total FROM rutas WHERE activo = 1",
    asignaciones: 'SELECT COUNT(*) AS total FROM asignaciones_ruta WHERE activo = 1',
    reportes: "SELECT COUNT(*) AS pendientes FROM reportes WHERE estado IN ('pendiente','en_proceso')",
    soat: "SELECT COUNT(*) AS cnt FROM vehiculos WHERE activo = 1 AND vigencia_soat IS NOT NULL AND vigencia_soat <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)",
    revision: "SELECT COUNT(*) AS cnt FROM vehiculos WHERE activo = 1 AND vigencia_revision_tecnica IS NOT NULL AND vigencia_revision_tecnica <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)",
    notifNoLeidas: "SELECT COUNT(*) AS cnt FROM notificaciones WHERE leido = 0 AND estado = 'activo'",
  };

  const results = {};
  let pendientes = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    pool.query(sql, (err, rows) => {
      if (err) {
        results[key] = { error: err.message };
      } else {
        if (key === 'vehiculos') {
          const estados = {};
          rows.forEach(r => estados[r.estado] = r.cnt);
          results.vehiculos = { total: Object.values(estados).reduce((a, b) => a + b, 0), ...estados };
        } else {
          results[key] = rows[0] ? Object.values(rows[0])[0] : 0;
        }
      }
      pendientes--;
      if (pendientes === 0) return res.json(results);
    });
  });
};

module.exports = { resumen };
