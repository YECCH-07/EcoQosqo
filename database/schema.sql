-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: software
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asignaciones_ruta`
--

DROP TABLE IF EXISTS `asignaciones_ruta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_ruta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ruta_id` int NOT NULL,
  `equipo_id` int DEFAULT NULL,
  `vehiculo_id` int DEFAULT NULL,
  `conductor_id` int DEFAULT NULL,
  `ayudante_id` int DEFAULT NULL,
  `fecha` date DEFAULT (curdate()),
  `turno` enum('mañana','tarde','noche') COLLATE utf8mb4_unicode_ci DEFAULT 'mañana',
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ruta_id` (`ruta_id`),
  KEY `vehiculo_id` (`vehiculo_id`),
  KEY `conductor_id` (`conductor_id`),
  KEY `ayudante_id` (`ayudante_id`),
  KEY `fk_asig_equipo` (`equipo_id`),
  CONSTRAINT `asignaciones_ruta_ibfk_1` FOREIGN KEY (`ruta_id`) REFERENCES `rutas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_ruta_ibfk_2` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_ruta_ibfk_3` FOREIGN KEY (`conductor_id`) REFERENCES `personal` (`id`) ON DELETE SET NULL,
  CONSTRAINT `asignaciones_ruta_ibfk_4` FOREIGN KEY (`ayudante_id`) REFERENCES `personal` (`id`) ON DELETE SET NULL,
  CONSTRAINT `asignaciones_ruta_ibfk_5` FOREIGN KEY (`equipo_id`) REFERENCES `equipos_trabajo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipo_personal`
--

DROP TABLE IF EXISTS `equipo_personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipo_personal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipo_id` int NOT NULL,
  `personal_id` int NOT NULL,
  `rol` enum('conductor','ayudante','barrendero') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ayudante',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_equipo_persona` (`equipo_id`,`personal_id`),
  KEY `personal_id` (`personal_id`),
  CONSTRAINT `equipo_personal_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `equipos_trabajo` (`id`) ON DELETE CASCADE,
  CONSTRAINT `equipo_personal_ibfk_2` FOREIGN KEY (`personal_id`) REFERENCES `personal` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipos_trabajo`
--

DROP TABLE IF EXISTS `equipos_trabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos_trabajo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('recoleccion','barrido') COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehiculo_id` int DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehiculo_id` (`vehiculo_id`),
  CONSTRAINT `equipos_trabajo_ibfk_1` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mantenimientos`
--

DROP TABLE IF EXISTS `mantenimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehiculo_id` int NOT NULL,
  `tipo` enum('preventivo','correctivo','predictivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'preventivo',
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `taller` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `costo` decimal(10,2) DEFAULT '0.00',
  `fecha_programada` date NOT NULL,
  `fecha_realizada` date DEFAULT NULL,
  `kilometraje_actual` int unsigned DEFAULT '0',
  `estado` enum('programado','en_proceso','completado','cancelado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'programado',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mant_vehiculo` (`vehiculo_id`),
  KEY `idx_mant_estado` (`estado`),
  KEY `idx_mant_fecha_programada` (`fecha_programada`),
  CONSTRAINT `fk_mantenimientos_vehiculo` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `leido` tinyint(1) DEFAULT '0',
  `fecha_lectura` datetime DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `usuario_id` int DEFAULT NULL,
  `rol_id` int DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personal`
--

DROP TABLE IF EXISTS `personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dni` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_id` int NOT NULL,
  `unidad_organica_id` int DEFAULT NULL,
  `fecha_contratacion` date DEFAULT NULL,
  `fecha_fin_contrato` date DEFAULT NULL,
  `honorarios` decimal(10,2) DEFAULT '0.00',
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `regimen_laboral` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'CAS',
  `condicion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Contratado CAS',
  `nivel` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Profesional',
  `nro_resolucion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo_institucional` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_personal_dni` (`dni`),
  KEY `tipo_id` (`tipo_id`),
  KEY `unidad_organica_id` (`unidad_organica_id`),
  CONSTRAINT `personal_ibfk_1` FOREIGN KEY (`tipo_id`) REFERENCES `tipos_personal` (`id`),
  CONSTRAINT `personal_ibfk_2` FOREIGN KEY (`unidad_organica_id`) REFERENCES `unidades_organicas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `puntos_ruta`
--

DROP TABLE IF EXISTS `puntos_ruta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puntos_ruta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ruta_id` int NOT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `orden` int NOT NULL DEFAULT '0',
  `tipo` enum('origen','parada','destino') COLLATE utf8mb4_unicode_ci DEFAULT 'parada',
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `direccion` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `tiempo_estimado` int DEFAULT '5' COMMENT 'minutos en esta parada',
  PRIMARY KEY (`id`),
  KEY `ruta_id` (`ruta_id`),
  CONSTRAINT `puntos_ruta_ibfk_1` FOREIGN KEY (`ruta_id`) REFERENCES `rutas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reportes`
--

DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prioridad` enum('baja','media','alta') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `estado` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `respuesta` text COLLATE utf8mb4_unicode_ci,
  `foto_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rutas`
--

DROP TABLE IF EXISTS `rutas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rutas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('recoleccion','barrido') COLLATE utf8mb4_unicode_ci DEFAULT 'recoleccion',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `zona` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dias` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Lunes a Sábado',
  `frecuencia` enum('diaria','interdiaria','semanal','personalizada') COLLATE utf8mb4_unicode_ci DEFAULT 'semanal',
  `horario_inicio` time NOT NULL DEFAULT '06:00:00',
  `horario_fin` time NOT NULL DEFAULT '14:00:00',
  `color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#4a001f',
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipos_personal`
--

DROP TABLE IF EXISTS `tipos_personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_personal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unidades_organicas`
--

DROP TABLE IF EXISTS `unidades_organicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidades_organicas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sigla` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `padre_id` int DEFAULT NULL,
  `nivel` int DEFAULT '0',
  `orden` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_unidades_padre` (`padre_id`),
  CONSTRAINT `fk_unidades_padre` FOREIGN KEY (`padre_id`) REFERENCES `unidades_organicas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario_rutas`
--

DROP TABLE IF EXISTS `usuario_rutas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rutas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `ruta_id` int NOT NULL,
  `asignado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_usuario_unico` (`usuario_id`),
  KEY `ruta_id` (`ruta_id`),
  CONSTRAINT `usuario_rutas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_rutas_ibfk_2` FOREIGN KEY (`ruta_id`) REFERENCES `rutas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `rol_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_usuarios_roles` (`rol_id`),
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehiculos`
--

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiculos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `placa` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('camion_recolector','compactador','volquete','camioneta','sedan','moto','otro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'otro',
  `marca` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modelo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anio` smallint unsigned NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `nro_motor` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `nro_chasis` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `capacidad` decimal(10,2) DEFAULT '0.00' COMMENT 'm3 o toneladas segun tipo',
  `tipo_combustible` enum('diesel','gasolina','gnv','electrico') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'diesel',
  `unidad_organica_id` int DEFAULT NULL,
  `responsable_id` int DEFAULT NULL,
  `estado` enum('operativo','mantenimiento','fuera_servicio','baja') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'operativo',
  `kilometraje_actual` int unsigned DEFAULT '0',
  `fecha_adquisicion` date DEFAULT NULL,
  `nro_soat` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `vigencia_soat` date DEFAULT NULL,
  `aseguradora_soat` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `nro_revision_tecnica` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `vigencia_revision_tecnica` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `placa` (`placa`),
  KEY `idx_vehiculos_unidad` (`unidad_organica_id`),
  KEY `idx_vehiculos_estado` (`estado`),
  KEY `idx_vehiculos_activo` (`activo`),
  KEY `idx_vigencia_soat` (`vigencia_soat`),
  KEY `idx_vigencia_revision` (`vigencia_revision_tecnica`),
  KEY `idx_vehiculos_responsable` (`responsable_id`),
  CONSTRAINT `fk_vehiculos_responsable` FOREIGN KEY (`responsable_id`) REFERENCES `personal` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vehiculos_unidad` FOREIGN KEY (`unidad_organica_id`) REFERENCES `unidades_organicas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'software'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-16 21:19:26

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Roles del sistema
INSERT INTO roles (id, nombre) VALUES
  (1, 'ADMIN'),
  (2, 'CIUDADANO'),
  (3, 'MAQUINARIAS'),
  (4, 'OPERADOR'),
  (5, 'OPERADOR DE NOTIFICACIONES'),
  (6, 'RECURSOS'),
  (8, 'EMPRESAS')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Tipos de personal
INSERT INTO tipos_personal (id, nombre) VALUES
  (1, 'Administrativo'), (2, 'Operario'), (3, 'Conductor'),
  (4, 'Recolector'), (5, 'Supervisor'), (6, 'Ayudante'),
  (7, 'Limpieza'), (8, 'Otro')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- NOTA: Los passwords son hashes bcrypt. Para desarrollo usar:
-- admin123, operador123, recursos123, cliente123, etc.
-- Generar con: bcrypt.hashSync('password', 10)
