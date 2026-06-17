const { pool } = require('../config/db');

// Fórmula Haversine: distancia en metros entre dos puntos GPS
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000; // radio Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180)
    * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Listar todas las rutas activas
async function findAll() {
  const [rows] = await pool.execute(
    'SELECT id, nombre, descripcion, zona, dias, horario_inicio, horario_fin, color FROM rutas WHERE activo = 1 ORDER BY nombre'
  );
  return rows;
}

// Obtener una ruta con sus puntos
async function findById(id) {
  const [[ruta]] = await pool.execute('SELECT * FROM rutas WHERE id = ?', [id]);
  if (!ruta) return null;
  const [puntos] = await pool.execute(
    'SELECT id, latitud, longitud, orden FROM puntos_ruta WHERE ruta_id = ? ORDER BY orden', [id]
  );
  return { ...ruta, puntos };
}

// Ruta más cercana a un punto GPS (carga todos los puntos en una sola query)
async function findNearest(lat, lng) {
  const [rutas] = await pool.execute('SELECT id, nombre, zona, dias, horario_inicio, horario_fin, color, descripcion FROM rutas WHERE activo = 1');
  if (!rutas.length) return null;

  // Cargar todos los puntos de todas las rutas en una sola query
  const [todosPuntos] = await pool.execute('SELECT ruta_id, latitud, longitud, orden FROM puntos_ruta ORDER BY ruta_id, orden');
  const puntosPorRuta = {};
  todosPuntos.forEach(p => {
    if (!puntosPorRuta[p.ruta_id]) puntosPorRuta[p.ruta_id] = [];
    puntosPorRuta[p.ruta_id].push(p);
  });

  let bestRuta = null;
  let bestDist = Infinity;
  let bestPunto = null;

  for (const ruta of rutas) {
    const puntos = puntosPorRuta[ruta.id] || [];
    if (!puntos.length) continue;
    for (const punto of puntos) {
      const dist = haversine(lat, lng, Number(punto.latitud), Number(punto.longitud));
      if (dist < bestDist) {
        bestDist = dist;
        bestRuta = { ...ruta, puntos };
        bestPunto = punto;
      }
    }
  }

  if (!bestRuta) return null;

  return {
    ruta: {
      id: bestRuta.id,
      nombre: bestRuta.nombre,
      zona: bestRuta.zona,
      dias: bestRuta.dias,
      horario_inicio: bestRuta.horario_inicio,
      horario_fin: bestRuta.horario_fin,
      color: bestRuta.color,
      descripcion: bestRuta.descripcion,
      puntos: bestRuta.puntos,
    },
    distancia_metros: Math.round(bestDist),
    punto_cercano: {
      latitud: Number(bestPunto.latitud),
      longitud: Number(bestPunto.longitud),
    },
  };
}

module.exports = { findAll, findById, findNearest };
