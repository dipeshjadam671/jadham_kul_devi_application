const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole, requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');
const { getYatraInfo, updateYatraInfo } = require('../controllers/yatraInfoController');

// Public GET yatra instructions
router.get('/:yatraType', getYatraInfo);

// Protected PUT yatra instructions
router.put(
  '/:yatraType',
  authenticateUser,
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.YATRA_INFO_MANAGE),
  updateYatraInfo
);

module.exports = router;
