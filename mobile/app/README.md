# App EcoQosqo Mobile

Aplicativo Expo con:

- Splash Screen
- Login conectado a `POST /api/auth/login`
- Persistencia de token JWT y usuario
- Dashboard visual para rol `CLIENTE`
- Navegación base hacia pantallas vacías

## Configurar API

La app intenta detectar automáticamente la IP del servidor Expo en modo LAN.
También puedes forzar la URL con `EXPO_PUBLIC_API_URL`.

- Android emulator: `http://10.0.2.2:5000/api`
- iOS simulator: `http://localhost:5000/api`
- Dispositivo físico: `http://IP_DE_TU_PC:5000/api`

## Ejecutar

```bash
npm install
npm start
```
