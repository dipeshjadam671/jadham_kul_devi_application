const express = require('express');
const router = express.Router();
const { upload, handleUpload } = require('../controllers/uploadController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

/**
 * File Upload Route - Phase 4
 * Authenticated admins and committee members can securely upload assets
 */
router.post('/', authenticateUser, requireRole('admin', 'committee'), upload.single('file'), handleUpload);

module.exports = router;
