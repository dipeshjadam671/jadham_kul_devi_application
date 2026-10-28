const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  verifyDonation,
  rejectDonation,
  archiveDonation,
  getDonationStats,
} = require('../controllers/donationController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Donation Management Routes - Phase 3
 * All administrative endpoints require authentication and verified permissions
 */

// All routes require authentication
router.use(authenticateUser);

// GET /api/v1/donations/stats - Get donation counts and aggregate sums
router.get('/stats', requirePermission(PERMISSIONS.DONATION_VIEW), getDonationStats);

// GET /api/v1/donations - List donations with search, filters, pagination
router.get('/', requirePermission(PERMISSIONS.DONATION_VIEW), getDonations);

// POST /api/v1/donations - Create a new donation record
router.post('/', requirePermission(PERMISSIONS.DONATION_CREATE), createDonation);

// GET /api/v1/donations/:id - Get single donation details
router.get('/:id', requirePermission(PERMISSIONS.DONATION_VIEW), getDonationById);

// PUT /api/v1/donations/:id - Update donation record
router.put('/:id', requirePermission(PERMISSIONS.DONATION_UPDATE), updateDonation);

// PATCH /api/v1/donations/:id/verify - Verify donation and issue receipt number
router.patch('/:id/verify', requirePermission(PERMISSIONS.DONATION_VERIFY), verifyDonation);

// PATCH /api/v1/donations/:id/reject - Reject donation with reason
router.patch('/:id/reject', requirePermission(PERMISSIONS.DONATION_VERIFY), rejectDonation);

// PATCH /api/v1/donations/:id/archive - Soft delete donation
router.patch('/:id/archive', requirePermission(PERMISSIONS.DONATION_ARCHIVE), archiveDonation);

module.exports = router;
