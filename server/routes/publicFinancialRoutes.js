const express = require('express');
const router = express.Router();
const {
  getPublicFinancialSummary,
  getPublicMonthlySummary,
  getPublicDonations,
  getPublicIncome,
  getPublicExpenses,
} = require('../controllers/publicFinancialController');

/**
 * Public Financial Transparency Routes - Phase 3
 * Accessible to any devotee or visitor without authentication
 */

// GET /api/v1/public/financial/summary - Overall verified revenue, expenses, and balance
router.get('/summary', getPublicFinancialSummary);

// GET /api/v1/public/financial/monthly-summary - Monthly financial chart data
router.get('/monthly-summary', getPublicMonthlySummary);

// GET /api/v1/public/financial/donations - Verified public donations list (mobile masked)
router.get('/donations', getPublicDonations);

// GET /api/v1/public/financial/income - Public non-donation temple income
router.get('/income', getPublicIncome);

// GET /api/v1/public/financial/expenses - Public transparent temple expenses
router.get('/expenses', getPublicExpenses);

module.exports = router;
