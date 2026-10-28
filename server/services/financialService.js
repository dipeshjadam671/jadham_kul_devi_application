const Donation = require('../models/Donation');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

/**
 * Financial Service - Phase 3
 * Centralized calculation engine for verified donations, income, expenses, and balances
 */

/**
 * Build date filter condition for queries
 */
const buildDateFilter = ({ year, month, from, to }, dateField = 'date') => {
  const filter = {};

  if (from || to) {
    filter[dateField] = {};
    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      filter[dateField].$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filter[dateField].$lte = toDate;
    }
    return filter;
  }

  if (year) {
    const y = parseInt(year, 10);
    if (!isNaN(y)) {
      if (month !== undefined && month !== '') {
        const m = parseInt(month, 10) - 1; // 0-indexed month
        const start = new Date(y, m, 1, 0, 0, 0);
        const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
        filter[dateField] = { $gte: start, $lte: end };
      } else {
        const start = new Date(y, 0, 1, 0, 0, 0);
        const end = new Date(y, 11, 31, 23, 59, 59, 999);
        filter[dateField] = { $gte: start, $lte: end };
      }
    }
  }

  return filter;
};

/**
 * Get Comprehensive Financial Summary
 * Formula:
 *   Total Verified Donations + Other Income = Total Income
 *   Current Balance = Total Income - Total Expenses
 */
const getFinancialSummary = async (dateParams = {}) => {
  const donationDateFilter = buildDateFilter(dateParams, 'donationDate');
  const generalDateFilter = buildDateFilter(dateParams, 'date');

  // 1. Total Verified Donations (only verified and non-archived)
  const donationAgg = await Donation.aggregate([
    {
      $match: {
        verificationStatus: 'verified',
        isArchived: { $ne: true },
        ...donationDateFilter,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalFinancialValue' },
        count: { $sum: 1 },
      },
    },
  ]);
  const totalVerifiedDonations = donationAgg[0]?.total || 0;
  const verifiedDonationCount = donationAgg[0]?.count || 0;

  // 2. Pending Donations (for admin alerting, NOT counted in balance)
  const pendingDonationAgg = await Donation.aggregate([
    {
      $match: {
        verificationStatus: 'pending',
        isArchived: { $ne: true },
        ...donationDateFilter,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalFinancialValue' },
        count: { $sum: 1 },
      },
    },
  ]);
  const totalPendingDonations = pendingDonationAgg[0]?.total || 0;
  const pendingDonationCount = pendingDonationAgg[0]?.count || 0;

  // 3. Other Temple Income (non-archived)
  const incomeAgg = await Income.aggregate([
    {
      $match: {
        isArchived: { $ne: true },
        ...generalDateFilter,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
  const totalOtherIncome = incomeAgg[0]?.total || 0;
  const incomeCount = incomeAgg[0]?.count || 0;

  // 4. Temple Expenses (non-archived)
  const expenseAgg = await Expense.aggregate([
    {
      $match: {
        isArchived: { $ne: true },
        ...generalDateFilter,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
  const totalExpenses = expenseAgg[0]?.total || 0;
  const expenseCount = expenseAgg[0]?.count || 0;

  // Total Official Income = Verified Donations + Other Income
  const totalIncome = totalVerifiedDonations + totalOtherIncome;
  const currentBalance = totalIncome - totalExpenses;

  return {
    totalDonations: totalVerifiedDonations,
    totalOtherIncome,
    totalIncome,
    totalExpenses,
    currentBalance,
    donationCount: verifiedDonationCount,
    pendingDonationCount,
    pendingDonationTotal: totalPendingDonations,
    incomeCount,
    expenseCount,
    filterApplied: dateParams,
  };
};

/**
 * Get Monthly Financial Summary for a specified year (Jan - Dec)
 */
const getMonthlySummary = async (targetYear = new Date().getFullYear()) => {
  const y = parseInt(targetYear, 10);
  const startOfYear = new Date(y, 0, 1, 0, 0, 0);
  const endOfYear = new Date(y, 11, 31, 23, 59, 59, 999);

  // Verified Donations by Month
  const monthlyDonations = await Donation.aggregate([
    {
      $match: {
        verificationStatus: 'verified',
        isArchived: { $ne: true },
        donationDate: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: '$donationDate' },
        total: { $sum: '$totalFinancialValue' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Other Income by Month
  const monthlyIncome = await Income.aggregate([
    {
      $match: {
        isArchived: { $ne: true },
        date: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: '$date' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Expenses by Month
  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        isArchived: { $ne: true },
        date: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: '$date' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthNamesHindi = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
  ];

  const result = [];
  for (let m = 1; m <= 12; m++) {
    const don = monthlyDonations.find((d) => d._id === m) || { total: 0, count: 0 };
    const inc = monthlyIncome.find((i) => i._id === m) || { total: 0, count: 0 };
    const exp = monthlyExpenses.find((e) => e._id === m) || { total: 0, count: 0 };

    const monthIncomeTotal = don.total + inc.total;
    const monthBalance = monthIncomeTotal - exp.total;

    result.push({
      monthNumber: m,
      month: monthNames[m - 1],
      monthHindi: monthNamesHindi[m - 1],
      donations: don.total,
      otherIncome: inc.total,
      income: monthIncomeTotal,
      expense: exp.total,
      balance: monthBalance,
      donationCount: don.count,
      incomeCount: inc.count,
      expenseCount: exp.count,
    });
  }

  return {
    year: y,
    months: result,
  };
};

/**
 * Get Multi-Year Financial Summary
 */
const getYearlySummary = async () => {
  // Verified Donations by Year
  const yearlyDonations = await Donation.aggregate([
    {
      $match: {
        verificationStatus: 'verified',
        isArchived: { $ne: true },
      },
    },
    {
      $group: {
        _id: { $year: '$donationDate' },
        total: { $sum: '$totalFinancialValue' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Income by Year
  const yearlyIncome = await Income.aggregate([
    {
      $match: { isArchived: { $ne: true } },
    },
    {
      $group: {
        _id: { $year: '$date' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Expenses by Year
  const yearlyExpenses = await Expense.aggregate([
    {
      $match: { isArchived: { $ne: true } },
    },
    {
      $group: {
        _id: { $year: '$date' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Gather unique years
  const allYears = Array.from(
    new Set([
      ...yearlyDonations.map((d) => d._id),
      ...yearlyIncome.map((i) => i._id),
      ...yearlyExpenses.map((e) => e._id),
      new Date().getFullYear(),
    ])
  ).filter(Boolean).sort((a, b) => b - a); // descending

  const yearsData = allYears.map((year) => {
    const don = yearlyDonations.find((d) => d._id === year) || { total: 0, count: 0 };
    const inc = yearlyIncome.find((i) => i._id === year) || { total: 0, count: 0 };
    const exp = yearlyExpenses.find((e) => e._id === year) || { total: 0, count: 0 };

    const totalYearIncome = don.total + inc.total;
    return {
      year,
      donations: don.total,
      otherIncome: inc.total,
      income: totalYearIncome,
      expense: exp.total,
      balance: totalYearIncome - exp.total,
      donationCount: don.count,
      incomeCount: inc.count,
      expenseCount: exp.count,
    };
  });

  return yearsData;
};

module.exports = {
  getFinancialSummary,
  getMonthlySummary,
  getYearlySummary,
  buildDateFilter,
};
