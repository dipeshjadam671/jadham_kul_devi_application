const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  archiveExpense,
  getExpenseStats,
} = require('../controllers/expenseController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Expense Management Routes - Phase 3
 */

// All routes require authentication
router.use(authenticateUser);

// GET /api/v1/expenses/stats - Expense category breakdown
router.get('/stats', requirePermission(PERMISSIONS.EXPENSE_VIEW), getExpenseStats);

// GET /api/v1/expenses - List expenses with pagination, search, filters
router.get('/', requirePermission(PERMISSIONS.EXPENSE_VIEW), getExpenses);

// POST /api/v1/expenses - Record new expense
router.post('/', requirePermission(PERMISSIONS.EXPENSE_CREATE), createExpense);

// GET /api/v1/expenses/:id - Single expense details
router.get('/:id', requirePermission(PERMISSIONS.EXPENSE_VIEW), getExpenseById);

// PUT /api/v1/expenses/:id - Update expense record
router.put('/:id', requirePermission(PERMISSIONS.EXPENSE_UPDATE), updateExpense);

// PATCH /api/v1/expenses/:id/archive - Soft delete expense record
router.patch('/:id/archive', requirePermission(PERMISSIONS.EXPENSE_ARCHIVE), archiveExpense);

module.exports = router;
