const YatraPayment = require('../models/YatraPayment');
const YatraRegistration = require('../models/YatraRegistration');

/**
 * Yatra Payment Controller - Phase 5
 * Handles payment recording, installment history, and updates registration payment totals.
 */

// POST /api/v1/yatra/payments
const createPayment = async (req, res, next) => {
  try {
    const {
      registrationId,
      amount,
      paymentMethod = 'cash',
      transactionId = '',
      notes = '',
      paymentDate = new Date(),
    } = req.body;

    if (!registrationId || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'पंजीकरण आईडी एवं वैध भुगतान राशि (> 0) अनिवार्य है।',
        errors: ['Invalid payment input'],
      });
    }

    const registration = await YatraRegistration.findById(registrationId);
    if (!registration || registration.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'संबंधित यात्रा पंजीकरण नहीं मिला।',
        errors: ['Yatra registration not found'],
      });
    }

    const payment = await YatraPayment.create({
      registrationId,
      amount: Number(amount),
      paymentDate: new Date(paymentDate),
      paymentMethod,
      transactionId,
      status: 'received',
      receivedBy: req.user?._id || null,
      notes,
    });

    // Recalculate total payments for this registration
    const allPayments = await YatraPayment.find({
      registrationId,
      status: 'received',
    });

    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    registration.paymentAmount = totalPaid;
    registration.paymentStatus = 'paid';
    registration.updatedBy = req.user?._id || null;
    await registration.save();

    res.status(201).json({
      success: true,
      message: `भुगतान राशि ₹${amount} सफलतापूर्वक दर्ज की गई!`,
      data: {
        payment,
        totalPaid,
        paymentStatus: registration.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/yatra/payments
const getPayments = async (req, res, next) => {
  try {
    const { registrationId, paymentMethod, page = 1, limit = 20 } = req.query;

    const query = {};
    if (registrationId) query.registrationId = registrationId;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, payments] = await Promise.all([
      YatraPayment.countDocuments(query),
      YatraPayment.find(query)
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('registrationId', 'registrationNumber primaryName mobile yatraType year')
        .populate('receivedBy', 'name role')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/yatra/payments/:id
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await YatraPayment.findById(id)
      .populate('registrationId')
      .populate('receivedBy', 'name role');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'भुगतान विवरण नहीं मिला।',
        errors: ['Payment record not found'],
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/yatra/payments/:id
const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, transactionId, paymentMethod } = req.body;

    const payment = await YatraPayment.findByIdAndUpdate(
      id,
      { notes, transactionId, paymentMethod },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'भुगतान विवरण नहीं मिला।',
      });
    }

    res.status(200).json({
      success: true,
      message: 'भुगतान विवरण अद्यतन किया गया।',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
};
