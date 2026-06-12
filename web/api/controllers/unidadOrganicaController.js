const unidadModel = require('../models/unidadOrganicaModel');

const listar = (req, res) => {
  unidadModel.findAll((err, unidades) => {
    if (err) return res.status(500).json({ message: 'Error al obtener unidades orgánicas' });
    return res.json(unidades);
  });
};

const obtener = (req, res) => {
  const { id } = req.params;
  unidadModel.findById(id, (err, unidad) => {
    if (err) return res.status(500).json({ message: 'Error al obtener la unidad' });
    if (!unidad) return res.status(404).json({ message: 'Unidad orgánica no encontrada' });
    return res.json(unidad);
  });
};

const crear = (req, res) => {
  const { nombre, sigla, padre_id, nivel, orden } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ message: 'El nombre de la unidad es obligatorio' });
  }

  const data = {
    nombre: nombre.trim(),
    sigla: (sigla || '').trim(),
    padre_id: padre_id || null,
    nivel: nivel || 0,
    orden: orden || 0,
  };

  unidadModel.create(data, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al crear la unidad' });
    return res.status(201).json(result);
  });
};

const actualizar = (req, res) => {
  const { id } = req.params;
  const { nombre, sigla, padre_id, nivel, orden, activo } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ message: 'El nombre de la unidad es obligatorio' });
  }

  // Evitar que una unidad sea su propio padre
  if (padre_id && Number(padre_id) === Number(id)) {
    return res.status(400).json({ message: 'Una unidad no puede ser su propio padre' });
  }

  const data = {
    nombre: nombre.trim(),
    sigla: (sigla || '').trim(),
    padre_id: padre_id || null,
    nivel: nivel || 0,
    orden: orden || 0,
    activo: activo !== undefined ? activo : 1,
  };

  unidadModel.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar la unidad' });
    if (!result) return res.status(404).json({ message: 'Unidad orgánica no encontrada' });
    return res.json(result);
  });
};

const eliminar = (req, res) => {
  const { id } = req.params;
  unidadModel.remove(id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar la unidad' });
    if (!result) return res.status(404).json({ message: 'Unidad orgánica no encontrada' });
    return res.json({ message: 'Unidad orgánica eliminada correctamente' });
  });
};

const hijos = (req, res) => {
  const { id } = req.params;
  const padreId = id === 'raiz' ? null : id;
  unidadModel.findByParent(padreId, (err, unidades) => {
    if (err) return res.status(500).json({ message: 'Error al obtener subunidades' });
    return res.json(unidades);
  });
};

const buscar = (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);
  unidadModel.search(q.trim(), (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al buscar' });
    return res.json(results);
  });
};

const arbol = (req, res) => {
  const { id } = req.params;
  unidadModel.getPath(id, (err, path) => {
    if (err) return res.status(500).json({ message: 'Error al obtener ruta' });
    return res.json(path);
  });
};

module.exports = { listar, obtener, hijos, buscar, arbol, crear, actualizar, eliminar };
