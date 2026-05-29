# Base de datos

La API usa las tablas existentes `usuarios` y `roles`.

Columnas esperadas o soportadas en `usuarios`:

- `id`
- `nombre` o `nombres`
- `apellidos` opcional
- `correo` o `email`
- `password_hash`, `password`, `contrasena` o `contraseña` con hash bcrypt
- `activo` o `estado` opcional
- `rol_id`

Columnas esperadas o soportadas en `roles`:

- `id`
- `nombre`, `rol`, `nombre_rol` o `descripcion`

El login móvil solo permite acceso cuando el rol resuelto es `CLIENTE`.

## SQL de inicialización

`schema.sql` crea la base `ecoqosqo`, registra los seis roles iniciales y agrega un usuario de prueba:

- correo: `cliente@ecoqosqo.pe`
- contraseña: `cliente123`
