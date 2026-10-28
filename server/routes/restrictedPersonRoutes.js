const express = require('express');
const router = express.Router();
const restrictedPersonController = require('../controllers/restrictedPersonController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole, requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Restricted Person Routes - Phase 6
 * Base path: /api/v1/restricted-persons
 *
 * CRITICAL PRIVACY RULE:
 * Strictly protected. NEVER open to public or unauthenticated traffic.
 */
router.use(authenticateUser);

// Dashboard counts (numbers only, zero names)
router.get(
  '/counts',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_VIEW),
  restrictedPersonController.getRestrictedCount
);

// Search endpoint
router.get(
  '/search',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_VIEW),
  restrictedPersonController.getRestrictedPersons
);

// Export CSV
router.get(
  '/export',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_EXPORT),
  restrictedPersonController.exportRestrictedCsv
);

// CRUD
router.post(
  '/',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_CREATE),
  restrictedPersonController.createRestrictedPerson
);

router.get(
  '/',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_VIEW),
  restrictedPersonController.getRestrictedPersons
);

router.get(
  '/:id',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_VIEW),
  restrictedPersonController.getRestrictedPersonById
);

router.put(
  '/:id',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_UPDATE),
  restrictedPersonController.updateRestrictedPerson
);

router.patch(
  '/:id/revoke',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_REVOKE),
  restrictedPersonController.revokeRestriction
);

router.patch(
  '/:id/archive',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.RESTRICTED_ARCHIVE),
  restrictedPersonController.archiveRestrictedPerson
);

module.exports = router;
