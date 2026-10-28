const express = require('express');
const router = express.Router();
const { getTempleInfo, updateTempleInfo } = require('../controllers/templeInfoController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Temple Information Routes - Phase 4
 */

// Public endpoint
router.get('/', getTempleInfo);

// Protected admin update endpoint
router.put('/', authenticateUser, requirePermission(PERMISSIONS.TEMPLE_INFO_MANAGE), updateTempleInfo);

module.exports = router;
