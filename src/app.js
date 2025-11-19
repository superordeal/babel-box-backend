const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const bibleItemRoutes = require('./routes/bibleItemRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const configRoutes = require('./routes/configRoutes');
const validateRoutes = require('./routes/validateRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/bible-items', bibleItemRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/config', configRoutes);
app.use('/api/validate', validateRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Bible Box API',
    version: '1.0.0',
    availableRoutes: [
      '/api/bible-items',
      '/api/categories',
      '/api/config',
      '/api/validate'
    ]
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
