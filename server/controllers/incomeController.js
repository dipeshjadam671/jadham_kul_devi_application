const Income = require('../models/Income');
const { buildDateFilter } = require('../services/financialService');

/**
 * Income Controller - Phase 3
 * Manages other non-donation temple revenue (e.g. event fees, rentals, sponsorships)
 */

/**
 * Create a new income record
 * POST /api/v1/income
 */
const createIncome = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      date,
      category,
      paymentMethod,
      referenceNumber,
      notes,
      isPublic,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Income title is required.',
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
        errors: ['category must be one of donation, event_income, rental, sponsorship, other'],
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required.',
        errors: ['paymentMethod must be one of cash, upi, bank_transfer, cheque, other'],
      });
    }

    const income = new Income({
      title: title.trim(),
      description: description ? description.trim() : '',
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      category,
      paymentMethod,
      referenceNumber: referenceNumber ? referenceNumber.trim() : '',
      notes: notes ? notes.trim() : '',
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      createdBy: req.user._id,
    });

    await income.save();

    return res.status(201).json({
      success: true,
      message: 'Income record created successfully.',
      data: income,
    });
  } catch (error) {
    console.error('Error creating income:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create income record.',
      errors: [error.message],
    });
  }
};

/**
 * Get paginated income with search and filters
 * GET /api/v1/income
 */
const getIncome = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
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
        { referenceNumber: searchRegex },
        { notes: searchRegex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [incomeList, total] = await Promise.all([
      Income.find(query)
        .populate('createdBy', 'name mobile role')
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Income.countDocuments(query),
    ]);

    // Aggregate total amount for filtered query
    const summaryAgg = await Income.aggregate([
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
      data: incomeList,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
      summary: totals,
    });
  } catch (error) {
    console.error('Error fetching income:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve income records.',
      errors: [error.message],
    });
  }
};

/**
 * Get income by ID
 * GET /api/v1/income/:id
 */
const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id)
      .populate('createdBy', 'name mobile role')
      .populate('updatedBy', 'name mobile role');

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error('Error fetching income by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch income record.',
      errors: [error.message],
    });
  }
};

/**
 * Update income record
 * PUT /api/v1/income/:id
 */
const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found.',
      });
    }

    const updatableFields = [
      'title',
      'description',
      'amount',
      'date',
      'category',
      'paymentMethod',
      'referenceNumber',
      'notes',
      'isPublic',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'amount') {
          income.amount = Number(req.body[field]) || 0;
        } else if (field === 'date') {
          income.date = new Date(req.body[field]);
        } else {
          income[field] = req.body[field];
        }
      }
    });

    income.updatedBy = req.user._id;
    await income.save();

    return res.status(200).json({
      success: true,
      message: 'Income record updated successfully.',
      data: income,
    });
  } catch (error) {
    console.error('Error updating income:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update income record.',
      errors: [error.message],
    });
  }
};

/**
 * Archive income record (Soft delete)
 * PATCH /api/v1/income/:id/archive
 */
const archiveIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found.',
      });
    }

    income.isArchived = true;
    income.updatedBy = req.user._id;
    await income.save();

    return res.status(200).json({
      success: true,
      message: 'Income record archived successfully.',
      data: { id: income._id, isArchived: true },
    });
  } catch (error) {
    console.error('Error archiving income:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to archive income record.',
      errors: [error.message],
    });
  }
};

/**
 * Get income category breakdown stats
 * GET /api/v1/income/stats
 */
const getIncomeStats = async (req, res) => {
  try {
    const stats = await Income.aggregate([
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
    console.error('Error fetching income stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch income stats.',
      errors: [error.message],
    });
  }
};

module.exports = {
  createIncome,
  getIncome,
  getIncomeById,
  updateIncome,
  archiveIncome,
  getIncomeStats,
};
