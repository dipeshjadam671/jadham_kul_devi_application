const Donation = require('../models/Donation');
const { generateReceiptNumber } = require('../services/receiptService');
const { buildDateFilter } = require('../services/financialService');

/**
 * Donation Controller - Phase 3
 * Complete audit-ready management of temple donations
 */

/**
 * Create a new donation record
 * POST /api/v1/donations
 */
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      village,
      city,
      address,
      mobile,
      donationDate,
      donationType,
      paymentMethod,
      amount,
      itemName,
      itemQuantity,
      itemUnit,
      itemPrice,
      transactionId,
      purpose,
      notes,
      isPublic,
      autoVerify,
    } = req.body;

    if (!donorName || !donorName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Donor name is required.',
        errors: ['donorName cannot be empty'],
      });
    }

    if (!donationType) {
      return res.status(400).json({
        success: false,
        message: 'Donation type is required.',
        errors: ['donationType must be one of cash, upi, bank_transfer, item, mixed, other'],
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required.',
        errors: ['paymentMethod must be one of cash, upi, bank_transfer, cheque, other'],
      });
    }

    const isItem = donationType === 'item' || donationType === 'mixed';
    if (isItem && (!itemName || !itemName.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required for item or mixed donations.',
        errors: ['itemName cannot be empty when donationType is item or mixed'],
      });
    }

    const newDonation = new Donation({
      donorName: donorName.trim(),
      village: village ? village.trim() : '',
      city: city ? city.trim() : '',
      address: address ? address.trim() : '',
      mobile: mobile ? mobile.trim() : '',
      donationDate: donationDate ? new Date(donationDate) : new Date(),
      donationType,
      paymentMethod,
      amount: Number(amount) || 0,
      itemName: isItem ? itemName.trim() : '',
      itemQuantity: isItem ? Number(itemQuantity) || 0 : 0,
      itemUnit: isItem && itemUnit ? itemUnit.trim() : '',
      itemPrice: isItem ? Number(itemPrice) || 0 : 0,
      transactionId: transactionId ? transactionId.trim() : '',
      purpose: purpose ? purpose.trim() : 'सामान्य दान (General Donation)',
      notes: notes ? notes.trim() : '',
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      createdBy: req.user._id,
      verificationStatus: 'pending',
    });

    // Auto-verify if requested and user has admin role or DONATION_VERIFY permission
    const canVerify =
      req.user.role === 'admin' ||
      (Array.isArray(req.user.permissions) && req.user.permissions.includes('DONATION_VERIFY'));

    if (autoVerify && canVerify) {
      newDonation.receiptNumber = await generateReceiptNumber(newDonation.donationDate);
      newDonation.verificationStatus = 'verified';
      newDonation.verifiedAt = new Date();
      newDonation.verifiedBy = req.user._id;
    }

    await newDonation.save();

    return res.status(201).json({
      success: true,
      message:
        newDonation.verificationStatus === 'verified'
          ? `Donation registered and verified. Receipt: ${newDonation.receiptNumber}`
          : 'Donation registered successfully (pending verification).',
      data: newDonation,
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create donation record.',
      errors: [error.message],
    });
  }
};

/**
 * Get paginated donations with search and filters
 * GET /api/v1/donations
 */
const getDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,
      paymentMethod,
      year,
      month,
      from,
      to,
      isArchived,
      sortBy = 'donationDate',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Archival filter
    if (isArchived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = { $ne: true };
    }

    // Status filter
    if (status) {
      query.verificationStatus = status;
    }

    // Donation Type filter
    if (type) {
      query.donationType = type;
    }

    // Payment Method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    const dateQuery = buildDateFilter({ year, month, from, to }, 'donationDate');
    if (dateQuery.donationDate) {
      query.donationDate = dateQuery.donationDate;
    }

    // Text search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { donorName: searchRegex },
        { village: searchRegex },
        { city: searchRegex },
        { mobile: searchRegex },
        { receiptNumber: searchRegex },
        { transactionId: searchRegex },
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
        .populate('createdBy', 'name mobile role')
        .populate('verifiedBy', 'name role')
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Donation.countDocuments(query),
    ]);

    // Financial totals for this filtered query
    const summaryAgg = await Donation.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalFinancialValue: { $sum: '$totalFinancialValue' },
          totalMonetaryAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totals = summaryAgg[0] || {
      totalFinancialValue: 0,
      totalMonetaryAmount: 0,
      count: 0,
    };

    return res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
      summary: totals,
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve donations.',
      errors: [error.message],
    });
  }
};

/**
 * Get donation details by ID
 * GET /api/v1/donations/:id
 */
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('createdBy', 'name mobile role')
      .populate('updatedBy', 'name mobile role')
      .populate('verifiedBy', 'name mobile role');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.',
        errors: ['No donation found with the specified ID'],
      });
    }

    return res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error('Error fetching donation by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch donation record.',
      errors: [error.message],
    });
  }
};

/**
 * Update donation record
 * PUT /api/v1/donations/:id
 */
const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.',
      });
    }

    // If donation is already verified, only admins can alter financial amounts
    const isEditingFinancialValues =
      (req.body.amount !== undefined && req.body.amount !== donation.amount) ||
      (req.body.donationType !== undefined && req.body.donationType !== donation.donationType) ||
      (req.body.itemPrice !== undefined && req.body.itemPrice !== donation.itemPrice) ||
      (req.body.itemQuantity !== undefined && req.body.itemQuantity !== donation.itemQuantity);

    if (donation.verificationStatus === 'verified' && isEditingFinancialValues && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators can modify financial values of a verified donation.',
        errors: ['Financial modifications on verified donations restricted to admin'],
      });
    }

    const updatableFields = [
      'donorName',
      'village',
      'city',
      'address',
      'mobile',
      'donationDate',
      'donationType',
      'paymentMethod',
      'amount',
      'itemName',
      'itemQuantity',
      'itemUnit',
      'itemPrice',
      'transactionId',
      'purpose',
      'notes',
      'isPublic',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        donation[field] = req.body[field];
      }
    });

    donation.updatedBy = req.user._id;

    // Save triggers pre-save hook to recompute totalFinancialValue
    await donation.save();

    return res.status(200).json({
      success: true,
      message: 'Donation record updated successfully.',
      data: donation,
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update donation record.',
      errors: [error.message],
    });
  }
};

/**
 * Verify donation and generate atomic sequential receipt number
 * PATCH /api/v1/donations/:id/verify
 */
const verifyDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.',
      });
    }

    if (donation.verificationStatus === 'verified') {
      return res.status(400).json({
        success: false,
        message: `Donation is already verified with receipt number: ${donation.receiptNumber}`,
        data: donation,
      });
    }

    // Generate atomic sequential receipt number
    if (!donation.receiptNumber) {
      donation.receiptNumber = await generateReceiptNumber(donation.donationDate);
    }

    donation.verificationStatus = 'verified';
    donation.verifiedAt = new Date();
    donation.verifiedBy = req.user._id;
    donation.rejectionReason = '';
    donation.updatedBy = req.user._id;

    await donation.save();

    return res.status(200).json({
      success: true,
      message: `Donation verified successfully. Receipt Number: ${donation.receiptNumber}`,
      data: donation,
    });
  } catch (error) {
    console.error('Error verifying donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify donation.',
      errors: [error.message],
    });
  }
};

/**
 * Reject donation
 * PATCH /api/v1/donations/:id/reject
 */
const rejectDonation = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required.',
        errors: ['reason cannot be empty'],
      });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.',
      });
    }

    donation.verificationStatus = 'rejected';
    donation.rejectionReason = reason.trim();
    donation.verifiedAt = new Date();
    donation.verifiedBy = req.user._id;
    donation.updatedBy = req.user._id;

    await donation.save();

    return res.status(200).json({
      success: true,
      message: 'Donation marked as rejected.',
      data: donation,
    });
  } catch (error) {
    console.error('Error rejecting donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject donation.',
      errors: [error.message],
    });
  }
};

/**
 * Soft delete / Archive donation
 * PATCH /api/v1/donations/:id/archive
 */
const archiveDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.',
      });
    }

    donation.isArchived = true;
    donation.updatedBy = req.user._id;

    await donation.save();

    return res.status(200).json({
      success: true,
      message: 'Donation record archived successfully.',
      data: { id: donation._id, isArchived: true },
    });
  } catch (error) {
    console.error('Error archiving donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to archive donation.',
      errors: [error.message],
    });
  }
};

/**
 * Get donation verification and count statistics
 * GET /api/v1/donations/stats
 */
const getDonationStats = async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      { $match: { isArchived: { $ne: true } } },
      {
        $group: {
          _id: '$verificationStatus',
          totalAmount: { $sum: '$totalFinancialValue' },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      verified: { total: 0, count: 0 },
      pending: { total: 0, count: 0 },
      rejected: { total: 0, count: 0 },
      cancelled: { total: 0, count: 0 },
    };

    stats.forEach((item) => {
      if (result[item._id]) {
        result[item._id] = {
          total: item.totalAmount,
          count: item.count,
        };
      }
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch donation statistics.',
      errors: [error.message],
    });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  verifyDonation,
  rejectDonation,
  archiveDonation,
  getDonationStats,
};
