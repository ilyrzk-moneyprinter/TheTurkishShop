// Health check route for Cloud Run
const express = require('express');
const router = express.Router();

// Basic health check that returns OK
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'api',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router; 