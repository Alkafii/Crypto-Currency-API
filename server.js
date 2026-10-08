const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: supaya frontend (misal React di localhost:5173) boleh memanggil API ini
app.use(cors());

// Halaman info sederhana
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Cryptocurrency REST API (dummy data)',
    endpoints: [
      'GET /api/crypto',
      'GET /api/crypto?category=DeFi',
      'GET /api/crypto?min_price=1&max_price=100',
      'GET /api/crypto?category=DeFi&min_price=1&max_price=100',
      'GET /api/crypto/:symbol',
      'GET /api/categories',
    ],
  });
});

// Semua endpoint API
app.use('/api', apiRoutes);

// 404 untuk URL yang tidak terdaftar (tetap format JSON)
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

// 500 untuk error tak terduga
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});
