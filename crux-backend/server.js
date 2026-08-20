const express = require('express');
const cors = require('cors');
const env = require('./src/config/env');
const publicRoutes = require('./src/routes/publicRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = env.PORT;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CRUX-Backend-API',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/content', publicRoutes);
app.use('/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server if launched directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 CRUX by UTCRUX Local Backend running on http://0.0.0.0:${PORT}`);
    console.log(`   LAN Access:   http://192.168.1.7:${PORT}/`);
    console.log(`   Health Check: GET http://localhost:${PORT}/health`);
    console.log(`   Public Feed:  GET http://localhost:${PORT}/content/feed`);
    console.log(`   Latest Item:  GET http://localhost:${PORT}/content/latest`);
    console.log(`====================================================`);
  });
}

module.exports = app;
