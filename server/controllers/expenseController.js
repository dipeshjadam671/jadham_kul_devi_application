const Expense = require('../models/Expense');
const { buildDateFilter } = require('../services/financialService');

/**
 * Expense Controller - Phase 3
 * Manages temple operational, construction, festival, and maintenance expenditures
 */

/**
 * Create a new expense record
 * POST /api/v1/expenses
 */
const createExpense = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      date,
      category,
      vendor,
      paymentMethod,
      referenceNumber,
      billImageUrl,
      notes,
      isPublic,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Expense title is required.',
        errors: ['title cannot be empty'],
      });
    }

    if (amount === undefined || amount === null || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid non-negative amount is required.',
        errors: ['amount must be >= 0'],
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
        errors: ['category is required'],
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required.',
        errors: ['paymentMethod must be one of cash, upi, bank_transfer, cheque, other'],
      });
    }

    const expense = new Expense({
      title: title.trim(),
      description: description ? description.trim() : '',
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      category,
      vendor: vendor ? vendor.trim() : '',
      paymentMethod,
      referenceNumber: referenceNumber ? referenceNumber.trim() : '',
      billImageUrl: billImageUrl ? billImageUrl.trim() : '',
      notes: notes ? notes.trim() : '',
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      createdBy: req.user._id,
    });

    await expense.save();

    return res.status(201).json({
      success: true,
      message: 'Expense record created successfully.',
      data: expense,
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create expense record.',
      errors: [error.message],
    });
  }
};

/**
 * Get paginated expenses with search and filters
 * GET /api/v1/expenses
 */
const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      vendor,
      paymentMethod,
      year,
      month,
      from,
      to,
      isArchived,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (isArchived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }

    if (category) {
      query.category = category;
    }

    if (vendor) {
      query.vendor = new RegExp(vendor.trim(), 'i');
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const dateQuery = buildDateFilter({ year, month, from, to }, 'date');
    if (dateQuery.date) {
      query.date = dateQuery.date;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { vendor: searchRegex },
        { referenceNumber: searchRegex },
        { notes: searchRegex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('createdBy', 'name mobile role')
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Expense.countDocuments(query),
    ]);

    // Aggregate total amount for filtered query
    const summaryAgg = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totals = summaryAgg[0] || { totalAmount: 0, count: 0 };

    return res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
      summary: totals,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses.',
      errors: [error.message],
    });
  }
};

/**
 * Get expense by ID
 * GET /api/v1/expenses/:id
 */
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('createdBy', 'name mobile role')
      .populate('updatedBy', 'name mobile role');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error fetching expense by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expense record.',
      errors: [error.message],
    });
  }
};

/**
 * Update expense record
 * PUT /api/v1/expenses/:id
 */
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    const updatableFields = [
      'title',
      'description',
      'amount',
      'date',
      'category',
      'vendor',
      'paymentMethod',
      'referenceNumber',
      'billImageUrl',
      'notes',
      'isPublic',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'amount') {
          expense.amount = Number(req.body[field]) || 0;
        } else if (field === 'date') {
          expense.date = new Date(req.body[field]);
        } else {
          expense[field] = req.body[field];
        }
      }
    });

    expense.updatedBy = req.user._id;
    await expense.save();

    return res.status(200).json({
      success: true,
      message: 'Expense record updated successfully.',
      data: expense,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update expense record.',
      errors: [error.message],
    });
  }
};

/**
 * Archive expense record (Soft delete)
 * PATCH /api/v1/expenses/:id/archive
 */
const archiveExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    expense.isArchived = true;
    expense.updatedBy = req.user._id;
    await expense.save();

    return res.status(200).json({
      success: true,
      message: 'Expense record archived successfully.',
      data: { id: expense._id, isArchived: true },
    });
  } catch (error) {
    console.error('Error archiving expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to archive expense record.',
      errors: [error.message],
    });
  }
};

/**
 * Get expense category breakdown stats
 * GET /api/v1/expenses/stats
 */
const getExpenseStats = async (req, res) => {
  try {
    const stats = await Expense.aggregate([
      { $match: { isArchived: { $ne: true } } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expense stats.',
      errors: [error.message],
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  archiveExpense,
  getExpenseStats,
};
