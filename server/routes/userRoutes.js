const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

/**
 * User & Committee Management Routes - Phase 6
 * Base path: /api/v1/users
 *
 * All routes require authentication.
 * Administrative control is restricted to 'admin' role, with read-only
 * committee directory available to authorized committee users.
 */
router.use(authenticateUser);

// Committee directory listing & counts (accessible to committee and admin)
router.get(
  '/committee/list',
  requireRole('admin', 'committee'),
  userController.getCommitteeMembers
);

router.get(
  '/summary/counts',
  requireRole('admin', 'committee'),
  userController.getUserCounts
);

// Admin-only operations
router.get('/', requireRole('admin'), userController.getUsers);

router.post('/committee', requireRole('admin'), userController.createCommitteeMember);

router.get('/:id', requireRole('admin'), userController.getUserById);

router.put('/:id', requireRole('admin'), userController.updateUser);

router.patch('/:id/activate', requireRole('admin'), userController.activateUser);

router.patch('/:id/deactivate', requireRole('admin'), userController.deactivateUser);

router.patch('/:id/permissions', requireRole('admin'), userController.updateUserPermissions);

module.exports = router;
