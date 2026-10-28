const express = require('express');
const router = express.Router();
const pujaController = require('../controllers/pujaController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole, requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Puja Routes - Phase 6
 * Base path: /api/v1/puja
 *
 * All routes require authentication and appropriate roles/permissions.
 */
router.use(authenticateUser);

// Reports & Aggregations (mounted before :id param routes to avoid collision)
router.get(
  '/records/stats',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_VIEW),
  pujaController.getPujaStats
);

router.get(
  '/yearly-summary',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_REPORT_VIEW),
  pujaController.getYearlySummary
);

router.get(
  '/monthly-summary',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_REPORT_VIEW),
  pujaController.getMonthlySummary
);

router.get(
  '/export',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_EXPORT),
  pujaController.exportPujaCsv
);

// Puja Records CRUD
router.post(
  '/records',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_CREATE),
  pujaController.createPujaRecord
);

router.get(
  '/records',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_VIEW),
  pujaController.getPujaRecords
);

router.get(
  '/records/:id',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_VIEW),
  pujaController.getPujaRecordById
);

router.put(
  '/records/:id',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_UPDATE),
  pujaController.updatePujaRecord
);

router.patch(
  '/records/:id/archive',
  requireRole('admin', 'committee'),
  requirePermission(PERMISSIONS.PUJA_ARCHIVE),
  pujaController.archivePujaRecord
);

module.exports = router;
