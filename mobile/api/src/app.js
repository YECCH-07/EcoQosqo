const cors = require('cors');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const privateRoutes = require('./routes/privateRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API App EcoQosqo funcionando'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', privateRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
