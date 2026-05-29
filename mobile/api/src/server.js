const app = require('./app');
const { port } = require('./config/env');
const { testConnection } = require('./config/db');

async function startServer() {
  try {
    await testConnection();
    app.listen(port, () => {
      console.log(`Servidor App EcoQosqo escuchando en puerto ${port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();
