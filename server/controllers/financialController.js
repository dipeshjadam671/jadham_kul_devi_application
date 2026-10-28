const {
  getFinancialSummary,
  getMonthlySummary,
  getYearlySummary,
  buildDateFilter,
} = require('../services/financialService');
const Donation = require('../models/Donation');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

/**
 * Financial Controller - Phase 3
 * Aggregations, summaries, and CSV data export
 */

/**
 * Get comprehensive financial summary
 * GET /api/v1/financial/summary
 */
const getSummary = async (req, res) => {
  try {
    const summary = await getFinancialSummary(req.query);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error in getFinancialSummary controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate financial summary.',
      errors: [error.message],
    });
  }
};

/**
 * Get monthly financial breakdown for a year
 * GET /api/v1/financial/monthly-summary
 */
const getMonthly = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const monthly = await getMonthlySummary(year);
    return res.status(200).json({
      success: true,
      data: monthly,
    });
  } catch (error) {
    console.error('Error in getMonthly controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate monthly summary.',
      errors: [error.message],
    });
  }
};

/**
 * Get multi-year historical financial breakdown
 * GET /api/v1/financial/yearly-summary
 */
const getYearly = async (req, res) => {
  try {
    const yearly = await getYearlySummary();
    return res.status(200).json({
      success: true,
      data: yearly,
    });
  } catch (error) {
    console.error('Error in getYearly controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate yearly summary.',
      errors: [error.message],
    });
  }
};

/**
 * Helper to escape CSV cell fields
 */
const escapeCsv = (str) => {
  if (str === null || str === undefined) return '""';
  const stringified = String(str).replace(/"/g, '""');
  return `"${stringified}"`;
};

/**
 * Export Financial CSV
 * GET /api/v1/financial/export
 */
const exportFinancialCSV = async (req, res) => {
  try {
    const { type = 'donations', year, month, from, to } = req.query;
    let csvContent = '';
    let filename = `mandir_export_${type}_${Date.now()}.csv`;

    if (type === 'donations') {
      const dateQuery = buildDateFilter({ year, month, from, to }, 'donationDate');
      const donations = await Donation.find({
        isArchived: { $ne: true },
        ...dateQuery,
      })
        .sort({ donationDate: -1 })
        .lean();

      const headers = [
        'Receipt Number',
        'Date',
        'Donor Name',
        'Village / City',
        'Mobile',
        'Donation Type',
        'Payment Method',
        'Monetary Amount (₹)',
        'Item Name',
        'Item Quantity',
        'Item Unit',
        'Item Unit Price (₹)',
        'Item Total Value (₹)',
        'Total Financial Value (₹)',
        'Transaction ID',
        'Verification Status',
        'Purpose',
      ];

      const rows = donations.map((d) => [
        escapeCsv(d.receiptNumber || 'PENDING'),
        escapeCsv(new Date(d.donationDate).toLocaleDateString('en-IN')),
        escapeCsv(d.donorName),
        escapeCsv(`${d.village || ''} ${d.city ? `(${d.city})` : ''}`.trim()),
        escapeCsv(d.mobile || ''),
        escapeCsv(d.donationType),
        escapeCsv(d.paymentMethod),
        escapeCsv(d.amount),
        escapeCsv(d.itemName || ''),
        escapeCsv(d.itemQuantity || ''),
        escapeCsv(d.itemUnit || ''),
        escapeCsv(d.itemPrice || ''),
        escapeCsv(d.itemTotalValue || 0),
        escapeCsv(d.totalFinancialValue || 0),
        escapeCsv(d.transactionId || ''),
        escapeCsv(d.verificationStatus),
        escapeCsv(d.purpose || ''),
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    } else if (type === 'income') {
      const dateQuery = buildDateFilter({ year, month, from, to }, 'date');
      const incomeList = await Income.find({
        isArchived: { $ne: true },
        ...dateQuery,
      })
        .sort({ date: -1 })
        .lean();

      const headers = [
        'Date',
        'Title',
        'Category',
        'Payment Method',
        'Amount (₹)',
        'Reference Number',
        'Description',
        'Notes',
      ];

      const rows = incomeList.map((i) => [
        escapeCsv(new Date(i.date).toLocaleDateString('en-IN')),
        escapeCsv(i.title),
        escapeCsv(i.category),
        escapeCsv(i.paymentMethod),
        escapeCsv(i.amount),
        escapeCsv(i.referenceNumber || ''),
        escapeCsv(i.description || ''),
        escapeCsv(i.notes || ''),
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    } else if (type === 'expenses') {
      const dateQuery = buildDateFilter({ year, month, from, to }, 'date');
      const expenses = await Expense.find({
        isArchived: { $ne: true },
        ...dateQuery,
      })
        .sort({ date: -1 })
        .lean();

      const headers = [
        'Date',
        'Title',
        'Category',
        'Vendor',
        'Payment Method',
        'Amount (₹)',
        'Reference Number',
        'Description',
        'Notes',
      ];

      const rows = expenses.map((e) => [
        escapeCsv(new Date(e.date).toLocaleDateString('en-IN')),
        escapeCsv(e.title),
        escapeCsv(e.category),
        escapeCsv(e.vendor || ''),
        escapeCsv(e.paymentMethod),
        escapeCsv(e.amount),
        escapeCsv(e.referenceNumber || ''),
        escapeCsv(e.description || ''),
        escapeCsv(e.notes || ''),
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    } else if (type === 'summary') {
      const targetYear = year || new Date().getFullYear();
      const monthly = await getMonthlySummary(targetYear);

      const headers = [
        'Month',
        'Verified Donations (₹)',
        'Other Income (₹)',
        'Total Income (₹)',
        'Total Expenses (₹)',
        'Net Balance (₹)',
      ];

      const rows = monthly.months.map((m) => [
        escapeCsv(`${m.month} / ${m.monthHindi}`),
        escapeCsv(m.donations),
        escapeCsv(m.otherIncome),
        escapeCsv(m.income),
        escapeCsv(m.expense),
        escapeCsv(m.balance),
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      filename = `mandir_financial_statement_${targetYear}.csv`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid export type. Must be donations, income, expenses, or summary.',
      });
    }

    // Prepend UTF-8 BOM for Microsoft Excel Hindi/Unicode support
    const finalCsv = '\uFEFF' + csvContent;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(finalCsv);
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export financial data.',
      errors: [error.message],
    });
  }
};

module.exports = {
  getSummary,
  getMonthly,
  getYearly,
  exportFinancialCSV,
};
