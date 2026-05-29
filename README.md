# EcoQosqo 🌿

EcoQosqo es una plataforma integral diseñada para la gestión y monitoreo de servicios ambientales y recolección. Este repositorio contiene tanto la solución móvil como la plataforma web, unificadas bajo una arquitectura moderna y escalable.

## 🚀 Estructura del Proyecto

El proyecto está organizado en un monorepo simplificado para facilitar la gestión del ecosistema completo:

### 📱 Mobile (`/mobile`)
Desarrollado para ofrecer movilidad y respuesta inmediata en campo.
- **App (`/app`):** Aplicación móvil construida con **React Native (Expo)**.
- **API (`/api`):** Servicio backend especializado en Node.js para el soporte de la aplicación móvil.

### 💻 Web (`/web`)
Panel administrativo y operativo centralizado.
- **Client (`/client`):** Interfaz web de alto rendimiento desarrollada con **React** y **Vite**.
- **API (`/api`):** Backend robusto en Node.js para la gestión de datos y administración web.

## 🛠️ Tecnologías Principales

- **Frontend:** React, React Native (Expo), Vite.
- **Backend:** Node.js, Express.
- **Base de Datos:** MySQL (Arquitectura relacional).
- **Comunicación:** Axios para integración con APIs REST.

## ⚙️ Configuración Rápida

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/USUARIO/EcoQosqo.git
   ```

2. **Instalación de dependencias:**
   Es necesario ejecutar `npm install` en cada una de las subcarpetas del proyecto (`mobile/app`, `mobile/api`, `web/client`, `web/api`).

3. **Variables de Entorno:**
   Configurar los archivos `.env` en las carpetas `api` siguiendo el formato de los archivos `.env.example` proporcionados.

---
© 2026 EcoQosqo - Gestión Ambiental Inteligente.
