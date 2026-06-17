const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const listar = (req, res) => {
  userModel.findAll((err, usuarios) => {
    if (err) return res.status(500).json({ message: 'Error al obtener usuarios' });
    return res.json(usuarios);
  });
};

const obtener = (req, res) => {
  userModel.findById(req.params.id, (err, usuario) => {
    if (err) return res.status(500).json({ message: 'Error al obtener usuario' });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(usuario);
  });
};

const crear = (req, res) => {
  const { nombre, usuario, correo, password, rol_id } = req.body;
  if (!nombre || !nombre.trim()) return res.status(400).json({ message: 'El nombre es obligatorio' });
  if (!usuario || !usuario.trim()) return res.status(400).json({ message: 'El usuario es obligatorio' });
  if (!password || password.length < 6) return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  if (!rol_id) return res.status(400).json({ message: 'El rol es obligatorio' });

  const hash = bcrypt.hashSync(password, 10);
  userModel.create({ nombre: nombre.trim(), usuario: usuario.trim(), correo: correo || null, password_hash: hash, rol_id: Number(rol_id) }, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'El usuario o correo ya existe' });
      return res.status(500).json({ message: 'Error al crear usuario' });
    }
    return res.status(201).json({ id: result.id, nombre, usuario, correo, rol_id });
  });
};

const actualizar = (req, res) => {
  const { nombre, usuario, correo, activo, rol_id } = req.body;
  if (!nombre || !usuario) return res.status(400).json({ message: 'Nombre y usuario son obligatorios' });

  userModel.update(req.params.id, { nombre, usuario, correo, activo, rol_id: Number(rol_id) }, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'El usuario o correo ya existe' });
      return res.status(500).json({ message: 'Error al actualizar usuario' });
    }
    if (!result) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(result);
  });
};

const cambiarPassword = (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });

  const hash = bcrypt.hashSync(password, 10);
  userModel.updatePassword(req.params.id, hash, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al cambiar contraseña' });
    if (!result) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ message: 'Contraseña actualizada correctamente' });
  });
};

const eliminar = (req, res) => {
  userModel.remove(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al desactivar usuario' });
    if (!result) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ message: 'Usuario desactivado correctamente' });
  });
};

const contador = (req, res) => {
  userModel.countByRole((err, results) => {
    if (err) return res.status(500).json({ message: 'Error al contar usuarios' });
    return res.json(results);
  });
};

module.exports = { listar, obtener, crear, actualizar, cambiarPassword, eliminar, contador };
