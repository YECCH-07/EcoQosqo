const pool = require('../config/db');
const asignacionModel = require('../models/asignacionRutaModel');

// Mapa de nombres de día a índice (0=lunes...6=domingo)
const DIA_INDICE = { lunes: 0, martes: 1, miercoles: 2, jueves: 3, viernes: 4, sabado: 5, domingo: 6 };
const DIA_NOMBRES = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// Parsear "Lunes a Sábado" o "Lunes, Miércoles, Viernes" → Set(['lunes','miercoles','viernes'])
const parseDias = (diasTexto) => {
  if (!diasTexto) return new Set();
  const normalizado = diasTexto.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
    .trim();

  // Si es "todos los dias"
  if (normalizado === 'todos los dias') {
    return new Set(DIA_NOMBRES);
  }

  // Si es un rango: "lunes a sabado"
  const matchRango = normalizado.match(/^(\w+)\s+a\s+(\w+)$/);
  if (matchRango) {
    const inicio = DIA_INDICE[matchRango[1]];
    const fin = DIA_INDICE[matchRango[2]];
    if (inicio !== undefined && fin !== undefined && inicio <= fin) {
      return new Set(DIA_NOMBRES.slice(inicio, fin + 1));
    }
  }

  // Si es lista: "lunes, miercoles, viernes"
  return new Set(
    normalizado.split(',')
      .map(d => d.trim().replace(/\s+a\s+.*$/, '')) // quitar " a ..." residual
      .filter(d => DIA_INDICE[d] !== undefined)
  );
};

// Verificar si un equipo ya está asignado a otra ruta con días solapados
const verificarConflicto = (equipoId, rutaId, asignacionIdActual, callback) => {
  if (!equipoId) return callback(null); // sin equipo, sin conflicto

  // Obtener los días de la nueva ruta
  pool.query('SELECT dias, nombre FROM rutas WHERE id = ? AND activo = 1', [rutaId], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(new Error('Ruta no encontrada'));
    const nuevaRuta = results[0];
    const diasNueva = parseDias(nuevaRuta.dias);

    // Buscar otras asignaciones activas del mismo equipo
    let sql = `SELECT a.id, r.nombre AS ruta_nombre, r.dias FROM asignaciones_ruta a JOIN rutas r ON a.ruta_id = r.id WHERE a.equipo_id = ? AND a.activo = 1 AND a.ruta_id != ?`;
    const params = [equipoId, rutaId];
    if (asignacionIdActual) {
      sql += ' AND a.id != ?';
      params.push(asignacionIdActual);
    }
    pool.query(sql, params, (err2, asignaciones) => {
      if (err2) return callback(err2);
      for (const asig of asignaciones) {
        const diasExistente = parseDias(asig.dias);
        const solapados = [...diasNueva].filter(d => diasExistente.has(d));
        if (solapados.length > 0) {
          const msg = `Conflicto: El equipo ya está asignado a "${asig.ruta_nombre}" los días ${solapados.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}.`;
          return callback(new Error(msg));
        }
      }
      return callback(null);
    });
  });
};

const listar = (req, res) => {
  asignacionModel.findAll((err, asignaciones) => {
    if (err) return res.status(500).json({ message: 'Error al obtener asignaciones' });
    return res.json(asignaciones);
  });
};

const obtener = (req, res) => {
  asignacionModel.findById(req.params.id, (err, asignacion) => {
    if (err) return res.status(500).json({ message: 'Error al obtener la asignacion' });
    if (!asignacion) return res.status(404).json({ message: 'Asignacion no encontrada' });
    return res.json(asignacion);
  });
};

const crear = (req, res) => {
  const { ruta_id, equipo_id } = req.body;
  if (!ruta_id) return res.status(400).json({ message: 'La ruta es obligatoria' });
  if (!equipo_id) return res.status(400).json({ message: 'El equipo es obligatorio' });

  // Verificar que equipo y ruta sean del mismo tipo
  pool.query('SELECT r.tipo AS ruta_tipo, e.tipo AS eq_tipo FROM rutas r, equipos_trabajo e WHERE r.id = ? AND e.id = ?', [Number(ruta_id), Number(equipo_id)], (errTipo, resTipo) => {
    if (errTipo) return res.status(500).json({ message: 'Error al validar tipos' });
    if (!resTipo || resTipo.length === 0) return res.status(400).json({ message: 'Ruta o equipo no encontrado' });
    if (resTipo[0].ruta_tipo !== resTipo[0].eq_tipo) {
      return res.status(400).json({ message: `El equipo es de tipo "${resTipo[0].eq_tipo}" pero la ruta es de tipo "${resTipo[0].ruta_tipo}". Deben coincidir.` });
    }

    verificarConflicto(Number(equipo_id), Number(ruta_id), null, (errConflicto) => {
      if (errConflicto) return res.status(409).json({ message: errConflicto.message });

      // Validar que la ruta no tenga ya otra asignación activa
      pool.query('SELECT a.id, e.nombre AS equipo FROM asignaciones_ruta a JOIN equipos_trabajo e ON a.equipo_id = e.id WHERE a.ruta_id = ? AND a.activo = 1 LIMIT 1',
        [Number(ruta_id)], (errRuta, resRuta) => {
          if (errRuta) return res.status(500).json({ message: 'Error al validar ruta' });
          if (resRuta && resRuta.length > 0) {
            return res.status(409).json({ message: `La ruta ya está asignada al equipo "${resRuta[0].equipo}". Una ruta solo puede tener un equipo.` });
          }

          const data = { ruta_id: Number(ruta_id), equipo_id: Number(equipo_id), fecha: new Date().toISOString().slice(0, 10) };
          asignacionModel.create(data, (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al crear la asignacion' });
            return res.status(201).json(result);
          });
        });
    });
  });
};

const actualizar = (req, res) => {
  const { id } = req.params;
  const { ruta_id, equipo_id } = req.body;
  if (!ruta_id) return res.status(400).json({ message: 'La ruta es obligatoria' });
  if (!equipo_id) return res.status(400).json({ message: 'El equipo es obligatorio' });

  // Verificar que equipo y ruta sean del mismo tipo
  pool.query('SELECT r.tipo AS ruta_tipo, e.tipo AS eq_tipo FROM rutas r, equipos_trabajo e WHERE r.id = ? AND e.id = ?', [Number(ruta_id), Number(equipo_id)], (errTipo, resTipo) => {
    if (errTipo) return res.status(500).json({ message: 'Error al validar tipos' });
    if (!resTipo || resTipo.length === 0) return res.status(400).json({ message: 'Ruta o equipo no encontrado' });
    if (resTipo[0].ruta_tipo !== resTipo[0].eq_tipo) {
      return res.status(400).json({ message: `El equipo es de tipo "${resTipo[0].eq_tipo}" pero la ruta es de tipo "${resTipo[0].ruta_tipo}". Deben coincidir.` });
    }

    verificarConflicto(Number(equipo_id), Number(ruta_id), Number(id), (errConflicto) => {
      if (errConflicto) return res.status(409).json({ message: errConflicto.message });

      const data = { ruta_id: Number(ruta_id), equipo_id: Number(equipo_id), fecha: new Date().toISOString().slice(0, 10) };
      asignacionModel.update(id, data, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar la asignacion' });
        if (!result) return res.status(404).json({ message: 'Asignacion no encontrada' });
        return res.json(result);
      });
    });
  });
};

const eliminar = (req, res) => {
  asignacionModel.remove(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar la asignacion' });
    if (!result) return res.status(404).json({ message: 'Asignacion no encontrada' });
    return res.json({ message: 'Asignacion eliminada correctamente' });
  });
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
