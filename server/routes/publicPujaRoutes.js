const express = require('express');
const router = express.Router();
const publicPujaController = require('../controllers/publicPujaController');

/**
 * Public Puja Routes - Phase 6
 * Base path: /api/v1/public/puja
 * Unauthenticated endpoints for public transparency (aggregates only).
 */
router.get('/summary', publicPujaController.getPublicPujaSummary);

module.exports = router;
