const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole, requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');
const {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  confirmRegistration,
  cancelRegistration,
  completeRegistration,
  archiveRegistration,
  getStats,
  getYearlySummaryReport,
  getMonthlySummaryReport,
  exportCsv,
} = require('../controllers/yatraController');

// All endpoints require authentication and admin/committee role
router.use(authenticateUser);
router.use(requireRole('admin', 'committee'));

// Analytics and Reports
router.get('/stats', requirePermission(PERMISSIONS.YATRA_VIEW, PERMISSIONS.YATRA_REPORT_VIEW), getStats);
router.get('/yearly-summary', requirePermission(PERMISSIONS.YATRA_REPORT_VIEW), getYearlySummaryReport);
router.get('/monthly-summary', requirePermission(PERMISSIONS.YATRA_REPORT_VIEW), getMonthlySummaryReport);
router.get('/export', requirePermission(PERMISSIONS.YATRA_EXPORT), exportCsv);

// Registrations CRUD
router.post(
  ['/', '/registrations'],
  requirePermission(PERMISSIONS.YATRA_CREATE),
  createRegistration
);

router.get(
  ['/', '/registrations'],
  requirePermission(PERMISSIONS.YATRA_VIEW),
  getRegistrations
);

router.get(
  ['/:id', '/registrations/:id'],
  requirePermission(PERMISSIONS.YATRA_VIEW),
  getRegistrationById
);

router.put(
  ['/:id', '/registrations/:id'],
  requirePermission(PERMISSIONS.YATRA_UPDATE),
  updateRegistration
);

// Status Transitions
router.patch(
  ['/:id/confirm', '/registrations/:id/confirm'],
  requirePermission(PERMISSIONS.YATRA_CONFIRM),
  confirmRegistration
);

router.patch(
  ['/:id/cancel', '/registrations/:id/cancel'],
  requirePermission(PERMISSIONS.YATRA_CANCEL),
  cancelRegistration
);

router.patch(
  ['/:id/complete', '/registrations/:id/complete'],
  requirePermission(PERMISSIONS.YATRA_COMPLETE),
  completeRegistration
);

router.patch(
  ['/:id/archive', '/registrations/:id/archive'],
  requirePermission(PERMISSIONS.YATRA_ARCHIVE),
  archiveRegistration
);

module.exports = router;
