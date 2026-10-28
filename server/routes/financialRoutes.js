const express = require('express');
const router = express.Router();
const {
  getSummary,
  getMonthly,
  getYearly,
  exportFinancialCSV,
} = require('../controllers/financialController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Financial Reports & Statements Routes - Phase 3
 */

// All routes require authentication
router.use(authenticateUser);

// GET /api/v1/financial/summary - Comprehensive balance & totals
router.get('/summary', requirePermission(PERMISSIONS.FINANCIAL_REPORT_VIEW), getSummary);

// GET /api/v1/financial/monthly-summary - 12-month breakdown for a year
router.get('/monthly-summary', requirePermission(PERMISSIONS.FINANCIAL_REPORT_VIEW), getMonthly);

// GET /api/v1/financial/yearly-summary - Multi-year overview
router.get('/yearly-summary', requirePermission(PERMISSIONS.FINANCIAL_REPORT_VIEW), getYearly);

// GET /api/v1/financial/export - CSV export
router.get('/export', requirePermission(PERMISSIONS.FINANCIAL_EXPORT), exportFinancialCSV);

module.exports = router;
