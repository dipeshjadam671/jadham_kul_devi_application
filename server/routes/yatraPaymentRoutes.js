const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole, requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
} = require('../controllers/yatraPaymentController');

// All payment endpoints require authentication and admin/committee role
router.use(authenticateUser);
router.use(requireRole('admin', 'committee'));

router.post(
  '/',
  requirePermission(PERMISSIONS.YATRA_PAYMENT_CREATE),
  createPayment
);

router.get(
  '/',
  requirePermission(PERMISSIONS.YATRA_PAYMENT_VIEW),
  getPayments
);

router.get(
  '/:id',
  requirePermission(PERMISSIONS.YATRA_PAYMENT_VIEW),
  getPaymentById
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.YATRA_PAYMENT_UPDATE),
  updatePayment
);

module.exports = router;
