const YatraRegistration = require('../models/YatraRegistration');
const YatraPayment = require('../models/YatraPayment');
const { generateYatraRegistrationNumber } = require('../services/yatraRegistrationNumberService');
const {
  getYatraRegistrations,
  validateStatusTransition,
  getYatraStats,
  getYearlySummary,
  getMonthlySummary,
  generateYatraCsv,
  checkDuplicateRegistration,
} = require('../services/yatraService');

/**
 * Yatra Registration Controller - Phase 5
 * Comprehensive administrative management of Ram Navami & Mansarovar Yatras.
 */

// POST /api/v1/yatra/registrations (Admin / Committee manual registration)
const createRegistration = async (req, res, next) => {
  try {
    const {
      yatraType,
      primaryName,
      mobile,
      village,
      city,
      address,
      travelDate,
      numberOfTravelers,
      travelers,
      bookingStatus = 'pending',
      paymentStatus = 'pending',
      paymentAmount = 0,
      paymentMethod = 'cash',
      transactionId,
      notes,
      travelOrganizer,
      organizerMobile,
      departureLocation,
      expectedReturnDate,
      allowDuplicate = false,
    } = req.body;

    if (!yatraType || !primaryName || !mobile || !travelDate) {
      return res.status(400).json({
        success: false,
        message: 'आवश्यक फ़ील्ड (यात्रा प्रकार, मुख्य व्यक्ति का नाम, मोबाइल नंबर, यात्रा दिनांक) अनिवार्य हैं।',
        errors: ['Missing required registration fields'],
      });
    }

    const tDate = new Date(travelDate);
    if (isNaN(tDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'अमान्य यात्रा दिनांक।',
        errors: ['Invalid travel date'],
      });
    }

    const year = tDate.getFullYear();

    // Duplicate check
    if (!allowDuplicate) {
      const dupCheck = await checkDuplicateRegistration({ mobile, yatraType, year, travelDate, primaryName });
      if (dupCheck.isDuplicate) {
        return res.status(409).json({
          success: false,
          isDuplicate: true,
          message: dupCheck.message,
          errors: ['Possible duplicate registration'],
        });
      }
    }

    // Generate unique sequential registration number
    const registrationNumber = await generateYatraRegistrationNumber(yatraType, tDate);

    // Sanitize travelers count
    const count = parseInt(numberOfTravelers, 10) || 1;
    let travelerList = Array.isArray(travelers) ? travelers : [];
    if (travelerList.length === 0) {
      // Create at least primary traveler
      travelerList = [{ name: primaryName, mobile, village, city }];
    }

    const registration = await YatraRegistration.create({
      registrationNumber,
      yatraType,
      year,
      primaryName,
      mobile,
      village,
      city,
      address,
      travelDate: tDate,
      numberOfTravelers: count,
      travelers: travelerList,
      bookingStatus,
      paymentStatus,
      paymentAmount: Number(paymentAmount) || 0,
      paymentMethod,
      transactionId,
      notes,
      travelOrganizer,
      organizerMobile,
      departureLocation: departureLocation || 'श्री जादम कुलदेवी मंदिर प्रांगण, खलघाट',
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      createdBy: req.user?._id || null,
    });

    // If initial payment was made and > 0, log in YatraPayment ledger
    if (Number(paymentAmount) > 0) {
      await YatraPayment.create({
        registrationId: registration._id,
        amount: Number(paymentAmount),
        paymentDate: new Date(),
        paymentMethod,
        transactionId: transactionId || '',
        status: 'received',
        receivedBy: req.user?._id || null,
        notes: 'प्रारंभिक पंजीकरण भुगतान (Initial registration payment)',
      });
    }

    res.status(201).json({
      success: true,
      message: `पंजीकरण सफलतापूर्वक संपन्न हुआ! पंजीकरण क्रमांक: ${registrationNumber}`,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/yatra/registrations
const getRegistrations = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      yatraType,
      year,
      bookingStatus,
      paymentStatus,
      village,
      city,
      paymentMethod,
      search,
      startDate,
      endDate,
      sortBy = 'travelDate',
      sortOrder = 'asc',
    } = req.query;

    const filters = {
      yatraType,
      year,
      bookingStatus,
      paymentStatus,
      village,
      city,
      paymentMethod,
      search,
      startDate,
      endDate,
    };

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const result = await getYatraRegistrations(filters, { page, limit }, sortOption);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/yatra/registrations/:id
const getRegistrationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const registration = await YatraRegistration.findById(id)
      .populate('createdBy', 'name role mobile')
      .populate('updatedBy', 'name role mobile');

    if (!registration || registration.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'पंजीकरण रिकॉर्ड नहीं मिला।',
        errors: ['Yatra registration not found'],
      });
    }

    // Fetch payment ledger history for this registration
    const payments = await YatraPayment.find({ registrationId: registration._id })
      .sort({ paymentDate: -1 })
      .populate('receivedBy', 'name role');

    res.status(200).json({
      success: true,
      data: {
        registration,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/yatra/registrations/:id
const updateRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Prevent client overriding audit keys
    delete updateData.registrationNumber;
    delete updateData.createdBy;
    delete updateData.createdAt;

    const existing = await YatraRegistration.findById(id);
    if (!existing || existing.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'पंजीकरण रिकॉर्ड नहीं मिला।',
        errors: ['Registration not found'],
      });
    }

    // If bookingStatus is changing, validate transition
    if (updateData.bookingStatus && updateData.bookingStatus !== existing.bookingStatus) {
      const transCheck = validateStatusTransition(existing.bookingStatus, updateData.bookingStatus, req.user?.role);
      if (!transCheck.isValid) {
        return res.status(400).json({
          success: false,
          message: transCheck.message,
          errors: ['Invalid status transition'],
        });
      }
    }

    if (updateData.travelDate) {
      updateData.travelDate = new Date(updateData.travelDate);
      updateData.year = updateData.travelDate.getFullYear();
    }

    updateData.updatedBy = req.user?._id;

    const updated = await YatraRegistration.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'पंजीकरण विवरण सफलतापूर्वक अद्यतन किया गया!',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/yatra/registrations/:id/confirm
const confirmRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await YatraRegistration.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'पंजीकरण नहीं मिला।' });
    }

    const check = validateStatusTransition(existing.bookingStatus, 'confirmed', req.user?.role);
    if (!check.isValid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    existing.bookingStatus = 'confirmed';
    existing.updatedBy = req.user?._id;
    await existing.save();

    res.status(200).json({
      success: true,
      message: `पंजीकरण ${existing.registrationNumber} की पुष्टि (Confirmed) कर दी गई।`,
      data: existing,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/yatra/registrations/:id/cancel
const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;
    const existing = await YatraRegistration.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'पंजीकरण नहीं मिला।' });
    }

    const check = validateStatusTransition(existing.bookingStatus, 'cancelled', req.user?.role);
    if (!check.isValid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    existing.bookingStatus = 'cancelled';
    if (reason) existing.notes = (existing.notes ? existing.notes + '\n' : '') + `रद्द करने का कारण: ${reason}`;
    existing.updatedBy = req.user?._id;
    await existing.save();

    res.status(200).json({
      success: true,
      message: `पंजीकरण ${existing.registrationNumber} रद्द (Cancelled) कर दिया गया।`,
      data: existing,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/yatra/registrations/:id/complete
const completeRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await YatraRegistration.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'पंजीकरण नहीं मिला।' });
    }

    const check = validateStatusTransition(existing.bookingStatus, 'completed', req.user?.role);
    if (!check.isValid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    existing.bookingStatus = 'completed';
    existing.updatedBy = req.user?._id;
    await existing.save();

    res.status(200).json({
      success: true,
      message: `पंजीकरण ${existing.registrationNumber} संपन्न (Completed) दर्ज किया गया।`,
      data: existing,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/yatra/registrations/:id/archive
const archiveRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await YatraRegistration.findByIdAndUpdate(
      id,
      { isArchived: true, updatedBy: req.user?._id },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'पंजीकरण नहीं मिला।' });
    }

    res.status(200).json({
      success: true,
      message: 'पंजीकरण अभिलेखागार (Archived) में भेज दिया गया।',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/yatra/registrations/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await getYatraStats(req.query);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/yatra/yearly-summary
const getYearlySummaryReport = async (req, res, next) => {
  try {
    const summary = await getYearlySummary();
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/yatra/monthly-summary
const getMonthlySummaryReport = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const summary = await getMonthlySummary(year);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/yatra/registrations/export
const exportCsv = async (req, res, next) => {
  try {
    const csvData = await generateYatraCsv(req.query);
    const filename = `yatra_registrations_${req.query.yatraType || 'all'}_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  confirmRegistration,
  cancelRegistration,
  completeRegistration,
  archiveRegistration,
  getStats,
  getYearlySummaryReport,
  getMonthlySummaryReport,
  exportCsv,
};
