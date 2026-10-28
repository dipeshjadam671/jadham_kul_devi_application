const YatraRegistration = require('../models/YatraRegistration');
const YatraPayment = require('../models/YatraPayment');

/**
 * Yatra Service - Phase 5
 * Core business logic, queries, duplicate checking, status flow, and analytics.
 */

/**
 * Get paginated list of Yatra Registrations with filters, search, and sorting
 */
const getYatraRegistrations = async (filters = {}, pagination = {}, sortOption = { travelDate: 1 }) => {
  const page = Math.max(1, parseInt(pagination.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const query = { isArchived: { $ne: true } };

  if (filters.yatraType) {
    query.yatraType = filters.yatraType;
  }
  if (filters.year) {
    query.year = parseInt(filters.year, 10);
  }
  if (filters.bookingStatus) {
    query.bookingStatus = filters.bookingStatus;
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.village) {
    query.village = new RegExp(filters.village.trim(), 'i');
  }
  if (filters.city) {
    query.city = new RegExp(filters.city.trim(), 'i');
  }
  if (filters.paymentMethod) {
    query.paymentMethod = filters.paymentMethod;
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.travelDate = {};
    if (filters.startDate) query.travelDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.travelDate.$lte = new Date(filters.endDate);
  }

  // Multi-field search
  if (filters.search && filters.search.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), 'i');
    query.$or = [
      { registrationNumber: searchRegex },
      { primaryName: searchRegex },
      { mobile: searchRegex },
      { village: searchRegex },
      { city: searchRegex },
      { 'travelers.name': searchRegex },
    ];
  }

  const [total, data] = await Promise.all([
    YatraRegistration.countDocuments(query),
    YatraRegistration.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name role')
      .populate('updatedBy', 'name role')
      .lean(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Check for possible duplicate registration
 */
const checkDuplicateRegistration = async ({ mobile, yatraType, year, travelDate, primaryName }) => {
  if (!mobile || !yatraType) return { isDuplicate: false };

  const regYear = year || (travelDate ? new Date(travelDate).getFullYear() : new Date().getFullYear());

  const existing = await YatraRegistration.findOne({
    mobile: mobile.trim(),
    yatraType,
    year: regYear,
    bookingStatus: { $ne: 'cancelled' },
    isArchived: { $ne: true },
  }).select('registrationNumber primaryName travelDate bookingStatus');

  if (existing) {
    return {
      isDuplicate: true,
      existingRegistrationNumber: existing.registrationNumber,
      message: `इस मोबाइल नंबर (${mobile}) पर ${yatraType === 'RAM_NAVAMI' ? 'रामनवमी' : 'मानसरोवर'} यात्रा (${regYear}) का पंजीकरण पहले से उपलब्ध है (पंजीकरण क्र.: ${existing.registrationNumber})।`,
    };
  }

  return { isDuplicate: false };
};

/**
 * Validate status transition
 */
const validateStatusTransition = (currentStatus, newStatus, userRole = 'committee') => {
  if (currentStatus === newStatus) return { isValid: true };

  const validTransitions = {
    pending: ['confirmed', 'cancelled', 'waitlisted'],
    waitlisted: ['confirmed', 'cancelled', 'pending'],
    confirmed: ['completed', 'cancelled'],
    completed: userRole === 'admin' ? ['confirmed', 'cancelled', 'pending'] : [], // Only admin can revert completed
    cancelled: userRole === 'admin' ? ['pending', 'confirmed'] : [], // Only admin can reopen cancelled
  };

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      isValid: false,
      message: `स्थिति परिवर्तन '${currentStatus}' से '${newStatus}' की अनुमति नहीं है।`,
    };
  }

  return { isValid: true };
};

/**
 * Get comprehensive Yatra stats
 */
const getYatraStats = async (filters = {}) => {
  const match = { isArchived: { $ne: true } };

  if (filters.year) match.year = parseInt(filters.year, 10);
  if (filters.yatraType) match.yatraType = filters.yatraType;
  if (filters.startDate || filters.endDate) {
    match.travelDate = {};
    if (filters.startDate) match.travelDate.$gte = new Date(filters.startDate);
    if (filters.endDate) match.travelDate.$lte = new Date(filters.endDate);
  }

  const [regStats, paymentStats] = await Promise.all([
    YatraRegistration.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          totalTravelers: { $sum: '$numberOfTravelers' },
          confirmedRegistrations: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] },
          },
          pendingRegistrations: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'pending'] }, 1, 0] },
          },
          cancelledRegistrations: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] },
          },
          completedRegistrations: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0] },
          },
          waitlistedRegistrations: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'waitlisted'] }, 1, 0] },
          },
          totalPaymentCollected: { $sum: '$paymentAmount' },
          pendingPaymentsCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] },
          },
          partialPaymentsCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] },
          },
          paidPaymentsCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
          },
        },
      },
    ]),
    YatraPayment.aggregate([
      {
        $lookup: {
          from: 'yatraregistrations',
          localField: 'registrationId',
          foreignField: '_id',
          as: 'registration',
        },
      },
      { $unwind: '$registration' },
      {
        $match: {
          ...(filters.year ? { 'registration.year': parseInt(filters.year, 10) } : {}),
          ...(filters.yatraType ? { 'registration.yatraType': filters.yatraType } : {}),
          status: 'received',
        },
      },
      {
        $group: {
          _id: null,
          totalLedgerAmount: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const stats = regStats[0] || {
    totalRegistrations: 0,
    totalTravelers: 0,
    confirmedRegistrations: 0,
    pendingRegistrations: 0,
    cancelledRegistrations: 0,
    completedRegistrations: 0,
    waitlistedRegistrations: 0,
    totalPaymentCollected: 0,
    pendingPaymentsCount: 0,
    partialPaymentsCount: 0,
    paidPaymentsCount: 0,
  };

  return {
    ...stats,
    totalLedgerPayments: paymentStats[0]?.totalLedgerAmount || stats.totalPaymentCollected,
  };
};

/**
 * Get yearly summary comparing Ram Navami vs Mansarovar
 */
const getYearlySummary = async () => {
  const pipeline = [
    { $match: { isArchived: { $ne: true } } },
    {
      $group: {
        _id: '$year',
        ramNavamiRegistrations: {
          $sum: { $cond: [{ $eq: ['$yatraType', 'RAM_NAVAMI'] }, 1, 0] },
        },
        ramNavamiTravelers: {
          $sum: {
            $cond: [{ $eq: ['$yatraType', 'RAM_NAVAMI'] }, '$numberOfTravelers', 0],
          },
        },
        mansarovarRegistrations: {
          $sum: { $cond: [{ $eq: ['$yatraType', 'MANSAROVAR'] }, 1, 0] },
        },
        mansarovarTravelers: {
          $sum: {
            $cond: [{ $eq: ['$yatraType', 'MANSAROVAR'] }, '$numberOfTravelers', 0],
          },
        },
        totalRegistrations: { $sum: 1 },
        totalTravelers: { $sum: '$numberOfTravelers' },
      },
    },
    { $sort: { _id: -1 } },
  ];

  const results = await YatraRegistration.aggregate(pipeline);

  return results.map((r) => ({
    year: r._id,
    ramNavamiRegistrations: r.ramNavamiRegistrations,
    ramNavamiTravelers: r.ramNavamiTravelers,
    mansarovarRegistrations: r.mansarovarRegistrations,
    mansarovarTravelers: r.mansarovarTravelers,
    totalRegistrations: r.totalRegistrations,
    totalTravelers: r.totalTravelers,
  }));
};

/**
 * Get monthly summary for a specific year
 */
const getMonthlySummary = async (targetYear = new Date().getFullYear()) => {
  const year = parseInt(targetYear, 10);
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

  const results = await YatraRegistration.aggregate([
    {
      $match: {
        isArchived: { $ne: true },
        travelDate: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: '$travelDate' },
        registrations: { $sum: 1 },
        travelers: { $sum: '$numberOfTravelers' },
        payments: { $sum: '$paymentAmount' },
        confirmed: {
          $sum: { $cond: [{ $eq: ['$bookingStatus', 'confirmed'] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$bookingStatus', 'cancelled'] }, 1, 0] },
        },
      },
    },
  ]);

  const monthNames = [
    'जनवरी (Jan)', 'फरवरी (Feb)', 'मार्च (Mar)', 'अप्रैल (Apr)',
    'मई (May)', 'जून (Jun)', 'जुलाई (Jul)', 'अगस्त (Aug)',
    'सितंबर (Sep)', 'अक्टूबर (Oct)', 'नवंबर (Nov)', 'दिसंबर (Dec)',
  ];

  const monthlyMap = new Map();
  results.forEach((r) => monthlyMap.set(r._id, r));

  const months = [];
  for (let m = 1; m <= 12; m++) {
    const data = monthlyMap.get(m) || {};
    months.push({
      month: m,
      monthName: monthNames[m - 1],
      registrations: data.registrations || 0,
      travelers: data.travelers || 0,
      payments: data.payments || 0,
      confirmed: data.confirmed || 0,
      cancelled: data.cancelled || 0,
    });
  }

  return { year, months };
};

/**
 * Generate CSV export of Yatra registrations
 */
const generateYatraCsv = async (filters = {}) => {
  const query = { isArchived: { $ne: true } };
  if (filters.yatraType) query.yatraType = filters.yatraType;
  if (filters.year) query.year = parseInt(filters.year, 10);
  if (filters.bookingStatus) query.bookingStatus = filters.bookingStatus;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

  const records = await YatraRegistration.find(query).sort({ travelDate: 1 }).lean();

  const headers = [
    'Registration Number',
    'Yatra Type',
    'Year',
    'Primary Name',
    'Mobile',
    'Village',
    'City',
    'Travel Date',
    'Traveler Count',
    'Booking Status',
    'Payment Status',
    'Payment Amount',
    'Payment Method',
    'Organizer',
    'Created Date',
  ];

  const escapeCsvField = (field) => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map((r) => [
    escapeCsvField(r.registrationNumber),
    escapeCsvField(r.yatraType),
    escapeCsvField(r.year),
    escapeCsvField(r.primaryName),
    escapeCsvField(r.mobile),
    escapeCsvField(r.village),
    escapeCsvField(r.city),
    escapeCsvField(r.travelDate ? new Date(r.travelDate).toISOString().split('T')[0] : ''),
    escapeCsvField(r.numberOfTravelers),
    escapeCsvField(r.bookingStatus),
    escapeCsvField(r.paymentStatus),
    escapeCsvField(r.paymentAmount),
    escapeCsvField(r.paymentMethod),
    escapeCsvField(r.travelOrganizer || ''),
    escapeCsvField(r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : ''),
  ]);

  const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  // Return with UTF-8 BOM for proper Hindi character rendering in Excel
  return '\uFEFF' + csvContent;
};

module.exports = {
  getYatraRegistrations,
  checkDuplicateRegistration,
  validateStatusTransition,
  getYatraStats,
  getYearlySummary,
  getMonthlySummary,
  generateYatraCsv,
};
