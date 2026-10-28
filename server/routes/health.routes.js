const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/health
 * @desc    API Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jadam Kuldevi Mandir API is running',
    timestamp: new Date().toISOString(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
    },
    version: '1.0.0',
    phase: 'Phase 1 - MERN Stack Foundation',
  });
});

module.exports = router;
