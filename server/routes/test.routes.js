const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

/**
 * Authorization Test Endpoints - Phase 2 Verification
 */

/**
 * @route   GET /api/v1/test/public
 * @desc    Unauthenticated public test route
 * @access  Public
 */
router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Public test route accessed successfully. No authentication required.',
    data: {
      access: 'public',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * @route   GET /api/v1/test/authenticated
 * @desc    Requires any authenticated user with valid Firebase token
 * @access  Private (Any authenticated user)
 */
router.get('/authenticated', authenticateUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated test route accessed successfully.',
    data: {
      access: 'authenticated',
      userId: req.user._id,
      role: req.user.role,
      mobile: req.user.mobile,
    },
  });
});

/**
 * @route   GET /api/v1/test/committee
 * @desc    Requires 'committee' or 'admin' role
 * @access  Private (Committee or Admin)
 */
router.get('/committee', authenticateUser, requireRole('admin', 'committee'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Committee test route accessed successfully. Role authorized.',
    data: {
      access: 'committee',
      userId: req.user._id,
      role: req.user.role,
    },
  });
});

/**
 * @route   GET /api/v1/test/admin
 * @desc    Requires 'admin' role exclusively
 * @access  Private (Admin only)
 */
router.get('/admin', authenticateUser, requireRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin test route accessed successfully. Administrator role confirmed.',
    data: {
      access: 'admin',
      userId: req.user._id,
      role: req.user.role,
    },
  });
});

module.exports = router;
