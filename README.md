# EcoQosqo 🌿

Plataforma integral de gestión ambiental para la Municipalidad del Cusco. Conecta operadores municipales, vehículos de recolección y ciudadanos en un solo ecosistema.

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                    CIUDADANO                          │
│  App Móvil (Expo/React Native) :8082                  │
│  └─ Reporta incidencias, ve su ruta, recibe avisos    │
└─────────────────┬────────────────────────────────────┘
                  │ REST
┌─────────────────▼────────────────────────────────────┐
│  Mobile API (Express) :5000                           │
│  └─ Auth móvil, GPS, uploads, notificaciones          │
└─────────────────┬────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│                   MySQL :3306                          │
│                 Base de datos                          │
│                   software                             │
└─────────────────▲────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│  Web API (Express) :5001                              │
│  └─ CRUD, lógica de negocio, alertas, reportes        │
└─────────────────┬────────────────────────────────────┘
                  │ REST
┌─────────────────▼────────────────────────────────────┐
│                    OPERADOR                            │
│  Panel Web (React/Vite) :5173                         │
│  └─ Dashboard, rutas, equipos, reportes, usuarios      │
└──────────────────────────────────────────────────────┘
```

---

## 📂 Estructura del Proyecto

```
EcoQosqo/
├── web/
│   ├── api/          # Backend panel web (Express, puerto 5001)
│   │   ├── config/        # Conexión MySQL
│   │   ├── controllers/   # 11 controladores
│   │   ├── middleware/     # JWT auth + control de roles
│   │   ├── models/        # 9 modelos (callbacks)
│   │   └── routes/        # 9 archivos de rutas
│   └── client/       # Frontend React (Vite, puerto 5173)
│       └── src/
│           ├── components/ # 14 componentes
│           └── styles.css  # Tema vinotinto institucional
├── mobile/
│   ├── api/          # Backend app móvil (Express, puerto 5000)
│   │   └── src/
│   │       ├── controllers/ # 6 controladores
│   │       ├── middleware/   # JWT
│   │       ├── models/      # 4 modelos (async/await)
│   │       └── routes/      # 3 archivos de rutas
│   └── app/          # App ciudadana (Expo/React Native, puerto 8082)
│       └── src/
│           ├── api/         # Cliente Axios
│           ├── context/     # AuthContext
│           ├── navigation/  # Stack Navigator
│           ├── screens/     # 8 pantallas
│           └── styles/      # Tema institucional
└── database/
    └── schema.sql    # Estructura completa (15 tablas)
```

---

## 🧩 Módulos

### Panel Web (Operador Municipal)

| Módulo | Roles | Funcionalidad |
|---|---|---|
| **Dashboard** | Todos | KPIs: vehículos, personal, rutas, reportes, alertas SOAT |
| **Organigrama** | ADMIN | Estructura jerárquica municipal, subunidades |
| **Personal** | ADMIN, RECURSOS | Conductores, operarios, recolectores, tipos |
| **Vehículos** | ADMIN, MAQUINARIAS | Flota, SOAT, revisión técnica, mantenimientos, alertas |
| **Rutas y Equipos** | ADMIN, OPERADOR | Rutas de recolección/barrido, equipos, asignaciones, mapa Leaflet/OSM |
| **Reportes** | NOTIFICACIONES | Bandeja de reportes ciudadanos, cambio de estado, responder |
| **Notificaciones** | NOTIFICACIONES | Envío de avisos masivos por rol |
| **Usuarios** | ADMIN | CRUD de usuarios, cambio de contraseña, contador por rol |

### App Móvil (Ciudadano)

| Pantalla | Funcionalidad |
|---|---|
| **Home** | GPS auto-asignación de ruta, próximas recolecciones, reportar incidencia |
| **Reportes** | Formulario con cámara/galería, GPS automático, prioridad por keywords |
| **Seguimiento** | Mapa Leaflet/OSM con ruta trazada y puntos de parada |
| **Notificaciones** | Bandeja con marca de leído, pull-to-refresh |
| **Horarios** | Detalle de ruta con timeline de paradas |
| **Perfil** | Datos del ciudadano + cerrar sesión |

---

## 🗄️ Base de Datos — 15 tablas

| Tabla | Descripción |
|---|---|
| `roles` | Roles del sistema (ADMIN, OPERADOR, CIUDADANO, etc.) |
| `usuarios` | Cuentas de acceso con bcrypt |
| `unidades_organicas` | Organigrama jerárquico municipal |
| `tipos_personal` | Categorías laborales |
| `personal` | Trabajadores municipales |
| `vehiculos` | Flota con datos SOAT/revisión |
| `mantenimientos` | Historial por vehículo |
| `rutas` | Rutas de recolección y barrido |
| `puntos_ruta` | Paradas georreferenciadas |
| `equipos_trabajo` | Equipos con conductor + ayudantes |
| `equipo_personal` | Miembros de cada equipo |
| `asignaciones_ruta` | Ruta ↔ Equipo con días |
| `usuario_rutas` | Ciudadano ↔ Ruta asignada |
| `reportes` | Incidencias reportadas con foto |
| `notificaciones` | Avisos push a ciudadanos |

---

## 🔑 Roles y Permisos

| Rol | ID | Acceso |
|---|---|---|
| **ADMIN** | 1 | Acceso total |
| **CIUDADANO** | 2 | App móvil: reportar, ver ruta, notificaciones |
| **MAQUINARIAS** | 3 | Vehículos, mantenimientos |
| **OPERADOR** | 4 | Rutas, equipos, asignaciones, dashboard |
| **OPERADOR DE NOTIFICACIONES** | 5 | Reportes ciudadanos, notificaciones |
| **RECURSOS** | 6 | Gestión de personal |
| **EMPRESAS** | 8 | App móvil (empresas generadoras) |

---

## 👥 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `operador` | `operador123` | OPERADOR |
| `recursos` | `recursos123` | RECURSOS |
| `notificador` | `notificador123` | OPERADOR DE NOTIFICACIONES |
| `maquinarias` | `maquinarias123` | MAQUINARIAS |

**App móvil** (usa correo electrónico):

| Correo | Contraseña | Rol |
|---|---|---|
| `cliente@ecoqosqo.pe` | `cliente123` | CIUDADANO |
| `empresa@ecoqosqo.pe` | `empresa123` | EMPRESAS |

---

## ⚙️ Instalación Rápida

### Requisitos
- Node.js ≥ 18
- MySQL ≥ 8
- npm

### 1. Clonar
```bash
git clone git@github.com:YECCH-07/EcoQosqo.git
cd EcoQosqo
```

### 2. Base de Datos
```bash
mysql -u root < database/schema.sql
```

### 3. Instalar dependencias
```bash
cd web/api && npm install && cd ../..
cd web/client && npm install && cd ../..
cd mobile/api && npm install && cd ../..
cd mobile/app && npm install && cd ../..
```

### 4. Variables de entorno (opcional)
Crear `.env` en `web/api/` y `mobile/api/`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=software
JWT_SECRET=ecoqosqo_web_secret_2026   # web/api
JWT_SECRET=ecoqosqo_mobile_secret_2026 # mobile/api
```

### 5. Iniciar servicios
```bash
# Web API (puerto 5001)
cd web/api && node server.js &

# Panel Web (puerto 5173)
cd web/client && npx vite --port 5173 &

# Mobile API (puerto 5000)
cd mobile/api && node src/server.js &

# App Móvil (puerto 8082)
cd mobile/app && npx expo start --web --port 8082 &
```

### 6. Acceder
- **Panel Web:** [http://localhost:5173](http://localhost:5173)
- **App Móvil:** [http://localhost:8082](http://localhost:8082)

---

## 🎨 Tema Institucional

| Color | Hex | Uso |
|---|---|---|
| Vinotinto | `#4a001f` | Primario, headers, botones principales |
| Vinotinto claro | `#7a1636` | Hover, acentos |
| Dorado | `#e0c397` | Acento (escudo del Cusco) |
| Fondo | `#fff7fa` | Background general |

---

## 🔐 Seguridad

- JWT con secretos independientes por API
- Passwords hasheados con bcrypt (10 rounds)
- Middleware `requireRole(...roles)` en endpoints sensibles
- Tokens expiran en 1 hora
- 401 interceptor limpia sesión en app móvil
- CORS configurado

---

## 📊 Endpoints Principales

### Web API (5001)
```
POST /api/login
GET  /api/dashboard
GET  /api/unidades-organicas
GET  /api/personal
GET  /api/vehiculos
POST /api/vehiculos/generar-alertas
GET  /api/rutas
GET  /api/equipos
GET  /api/asignaciones-ruta
GET  /api/reportes
PATCH /api/reportes/:id/estado
POST /api/reportes/:id/responder
GET  /api/notificaciones
POST /api/notificaciones
GET  /api/usuarios
PATCH /api/usuarios/:id/password
```

### Mobile API (5000)
```
POST /api/auth/login
GET  /api/me
GET  /api/rutas
GET  /api/usuario/mi-ruta
POST /api/usuario/asignar-ruta
GET  /api/notificaciones
PATCH /api/notificaciones/:id/leido
GET  /api/reportes
POST /api/reportes
POST /api/upload
```

---

© 2026 EcoQosqo · Gestión Ambiental Inteligente · Municipalidad del Cusco
