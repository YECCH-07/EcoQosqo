CREATE DATABASE IF NOT EXISTS ecoqosqo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecoqosqo;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE
);

INSERT INTO roles (id, nombre) VALUES
  (1, 'ADMIN'),
  (2, 'CLIENTE'),
  (3, 'MAQUINARIAS'),
  (4, 'OPERADOR'),
  (5, 'OPERADOR DE NOTIFICACIONES'),
  (6, 'RECURSOS')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  rol_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

INSERT INTO usuarios (nombre, correo, password_hash, activo, rol_id) VALUES
  ('Cliente EcoQosqo', 'cliente@ecoqosqo.pe', '$2a$10$KDxGlpaFX6JvTkMVkt/AwOPUooaZrRt9BrDUIzmIa993oWGrPXPJa', 1, 2)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  password_hash = VALUES(password_hash),
  activo = VALUES(activo),
  rol_id = VALUES(rol_id);
