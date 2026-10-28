const express = require('express');
const router = express.Router();
const {
  createIncome,
  getIncome,
  getIncomeById,
  updateIncome,
  archiveIncome,
  getIncomeStats,
} = require('../controllers/incomeController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Income Management Routes - Phase 3
 */

// All routes require authentication
router.use(authenticateUser);

// GET /api/v1/income/stats - Income category breakdown
router.get('/stats', requirePermission(PERMISSIONS.INCOME_VIEW), getIncomeStats);

// GET /api/v1/income - List income with pagination, search, filters
router.get('/', requirePermission(PERMISSIONS.INCOME_VIEW), getIncome);

// POST /api/v1/income - Record new income
router.post('/', requirePermission(PERMISSIONS.INCOME_CREATE), createIncome);

// GET /api/v1/income/:id - Single income details
router.get('/:id', requirePermission(PERMISSIONS.INCOME_VIEW), getIncomeById);

// PUT /api/v1/income/:id - Update income record
router.put('/:id', requirePermission(PERMISSIONS.INCOME_UPDATE), updateIncome);

// PATCH /api/v1/income/:id/archive - Soft delete income record
router.patch('/:id/archive', requirePermission(PERMISSIONS.INCOME_ARCHIVE), archiveIncome);

module.exports = router;
