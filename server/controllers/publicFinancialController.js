const Donation = require('../models/Donation');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const {
  getFinancialSummary,
  getMonthlySummary,
  buildDateFilter,
} = require('../services/financialService');

/**
 * Public Financial Controller - Phase 3
 * Public transparency endpoints:
 * - Strictly hides internal notes, donor full addresses, and internal user IDs.
 * - Masks donor mobile number: 98765XXXXX.
 * - Shows ONLY verified, public, non-archived donations.
 */

/**
 * Mask phone number: 9876543210 -> 98765XXXXX
 */
const maskMobile = (mobile) => {
  if (!mobile) return '';
  const digits = String(mobile).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(0, 5) + 'XXXXX';
  }
  return digits.length > 3 ? digits.slice(0, 3) + '***' : '***';
};

/**
 * Get Public Financial Summary
 * GET /api/v1/public/financial/summary
 */
const getPublicFinancialSummary = async (req, res) => {
  try {
    const summary = await getFinancialSummary(req.query);

    // Return sanitized public summary (exclude pending internal totals)
    return res.status(200).json({
      success: true,
      data: {
        totalDonations: summary.totalDonations,
        totalOtherIncome: summary.totalOtherIncome,
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        currentBalance: summary.currentBalance,
        donationCount: summary.donationCount,
        incomeCount: summary.incomeCount,
        expenseCount: summary.expenseCount,
        filterApplied: summary.filterApplied,
      },
    });
  } catch (error) {
    console.error('Error in getPublicFinancialSummary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public financial summary.',
      errors: [error.message],
    });
  }
};

/**
 * Get Public Monthly Breakdown
 * GET /api/v1/public/financial/monthly-summary
 */
const getPublicMonthlySummary = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const monthly = await getMonthlySummary(year);
    return res.status(200).json({
      success: true,
      data: monthly,
    });
  } catch (error) {
    console.error('Error in getPublicMonthlySummary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve monthly financial breakdown.',
      errors: [error.message],
    });
  }
};

/**
 * Get Public Verified Donations Register
 * GET /api/v1/public/financial/donations
 */
const getPublicDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      year,
      month,
      from,
      to,
      sortBy = 'donationDate',
      sortOrder = 'desc',
    } = req.query;

    const query = {
      isPublic: true,
      isArchived: { $ne: true },
      verificationStatus: 'verified',
    };

    if (type) {
      query.donationType = type;
    }

    const dateQuery = buildDateFilter({ year, month, from, to }, 'donationDate');
    if (dateQuery.donationDate) {
      query.donationDate = dateQuery.donationDate;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { donorName: searchRegex },
        { village: searchRegex },
        { city: searchRegex },
        { receiptNumber: searchRegex },
        { purpose: searchRegex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .select(
          '_id donorName village city donationDate donationType paymentMethod amount itemName itemQuantity itemUnit itemTotalValue totalFinancialValue receiptNumber purpose mobile'
        )
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Donation.countDocuments(query),
    ]);

    // Sanitize and mask mobile
    const sanitized = donations.map((d) => ({
      _id: d._id,
      donorName: d.donorName,
      village: d.village,
      city: d.city,
      donationDate: d.donationDate,
      donationType: d.donationType,
      paymentMethod: d.paymentMethod,
      amount: d.amount,
      itemName: d.itemName,
      itemQuantity: d.itemQuantity,
      itemUnit: d.itemUnit,
      itemTotalValue: d.itemTotalValue,
      totalFinancialValue: d.totalFinancialValue,
      receiptNumber: d.receiptNumber,
      purpose: d.purpose,
      mobileMasked: maskMobile(d.mobile),
    }));

    return res.status(200).json({
      success: true,
      data: sanitized,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getPublicDonations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public donations.',
      errors: [error.message],
    });
  }
};

/**
 * Get Public Income Register
 * GET /api/v1/public/financial/income
 */
const getPublicIncome = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      year,
      month,
      from,
      to,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const query = {
      isPublic: true,
      isArchived: { $ne: true },
    };

    if (category) {
      query.category = category;
    }

    const dateQuery = buildDateFilter({ year, month, from, to }, 'date');
    if (dateQuery.date) {
      query.date = dateQuery.date;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [incomeList, total] = await Promise.all([
      Income.find(query)
        .select('_id title description amount date category paymentMethod referenceNumber')
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Income.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: incomeList,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getPublicIncome:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public income records.',
      errors: [error.message],
    });
  }
};

/**
 * Get Public Expense Register
 * GET /api/v1/public/financial/expenses
 */
const getPublicExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      year,
      month,
      from,
      to,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const query = {
      isPublic: true,
      isArchived: { $ne: true },
    };

    if (category) {
      query.category = category;
    }

    const dateQuery = buildDateFilter({ year, month, from, to }, 'date');
    if (dateQuery.date) {
      query.date = dateQuery.date;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { vendor: searchRegex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .select('_id title description amount date category vendor paymentMethod')
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Expense.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getPublicExpenses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public expenses.',
      errors: [error.message],
    });
  }
};

module.exports = {
  getPublicFinancialSummary,
  getPublicMonthlySummary,
  getPublicDonations,
  getPublicIncome,
  getPublicExpenses,
};
