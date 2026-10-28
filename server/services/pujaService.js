const PujaRecord = require('../models/PujaRecord');
const { generatePujaRecordNumber } = require('./pujaRecordNumberService');

/**
 * Puja Service - Phase 6
 * Encapsulates all business logic for Mata Ji Annual Puja records,
 * aggregations, couple tracking, Jamal records, reports, and CSV export.
 */

/**
 * Creates a new Puja Record
 */
const createPujaRecord = async (data, userId) => {
  const year = Number(data.year) || new Date().getFullYear();

  // Validate counts
  if (data.numberOfPeople !== undefined && Number(data.numberOfPeople) < 1) {
    throw new Error('Number of participants must be at least 1');
  }
  if (data.numberOfCouples !== undefined && Number(data.numberOfCouples) < 0) {
    throw new Error('Number of couples cannot be negative');
  }
  if (data.jamalCount !== undefined && Number(data.jamalCount) < 0) {
    throw new Error('Jamal count cannot be negative');
  }
  if (data.amount !== undefined && Number(data.amount) < 0) {
    throw new Error('Payment amount cannot be negative');
  }

  // Generate atomic sequential record number
  const recordNumber = await generatePujaRecordNumber(year);

  const pujaRecord = new PujaRecord({
    ...data,
    recordNumber,
    year,
    numberOfPeople: Number(data.numberOfPeople) || 1,
    numberOfCouples: Number(data.numberOfCouples) || 0,
    jamalCount: Number(data.jamalCount) || 0,
    amount: Number(data.amount) || 0,
    createdBy: userId || null,
    updatedBy: userId || null,
  });

  return await pujaRecord.save();
};

/**
 * Retrieves paginated, filtered, and searched Puja Records
 */
const getPujaRecords = async (query = {}) => {
  const {
    year,
    pujaType,
    pujaDateFrom,
    pujaDateTo,
    village,
    pujaStatus,
    paymentStatus,
    search,
    isArchived,
    page = 1,
    limit = 20,
    sortBy = 'pujaDate',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  // Default: exclude archived unless explicitly requested
  if (isArchived === 'true' || isArchived === true) {
    filter.isArchived = true;
  } else if (isArchived === 'all') {
    // include both
  } else {
    filter.isArchived = false;
  }

  if (year) {
    filter.year = Number(year);
  }

  if (pujaType) {
    filter.pujaType = pujaType;
  }

  if (village) {
    filter.village = new RegExp(village.trim(), 'i');
  }

  if (pujaStatus) {
    filter.pujaStatus = pujaStatus;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  if (pujaDateFrom || pujaDateTo) {
    filter.pujaDate = {};
    if (pujaDateFrom) filter.pujaDate.$gte = new Date(pujaDateFrom);
    if (pujaDateTo) filter.pujaDate.$lte = new Date(pujaDateTo);
  }

  if (search && search.trim()) {
    const s = search.trim();
    const regex = new RegExp(s, 'i');
    filter.$or = [
      { recordNumber: regex },
      { primaryPersonName: regex },
      { familyName: regex },
      { mobile: regex },
      { village: regex },
      { city: regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [records, total] = await Promise.all([
    PujaRecord.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name mobile')
      .populate('updatedBy', 'name mobile')
      .lean(),
    PujaRecord.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Retrieves a single Puja Record by ID
 */
const getPujaRecordById = async (id) => {
  const record = await PujaRecord.findById(id)
    .populate('createdBy', 'name mobile')
    .populate('updatedBy', 'name mobile');

  if (!record) {
    throw new Error('Puja record not found');
  }

  return record;
};

/**
 * Updates an existing Puja Record
 */
const updatePujaRecord = async (id, data, userId) => {
  if (data.numberOfPeople !== undefined && Number(data.numberOfPeople) < 1) {
    throw new Error('Number of participants must be at least 1');
  }
  if (data.numberOfCouples !== undefined && Number(data.numberOfCouples) < 0) {
    throw new Error('Number of couples cannot be negative');
  }
  if (data.jamalCount !== undefined && Number(data.jamalCount) < 0) {
    throw new Error('Jamal count cannot be negative');
  }
  if (data.amount !== undefined && Number(data.amount) < 0) {
    throw new Error('Payment amount cannot be negative');
  }

  // Prevent client from overwriting recordNumber or createdBy
  delete data.recordNumber;
  delete data.createdBy;

  const updated = await PujaRecord.findByIdAndUpdate(
    id,
    {
      ...data,
      updatedBy: userId || null,
    },
    { new: true, runValidators: true }
  ).populate('createdBy updatedBy', 'name mobile');

  if (!updated) {
    throw new Error('Puja record not found');
  }

  return updated;
};

/**
 * Soft archives a Puja Record
 */
const archivePujaRecord = async (id, userId) => {
  const record = await PujaRecord.findByIdAndUpdate(
    id,
    {
      isArchived: true,
      pujaStatus: 'archived',
      updatedBy: userId || null,
    },
    { new: true }
  );

  if (!record) {
    throw new Error('Puja record not found');
  }

  return record;
};

/**
 * Computes dashboard statistics for Puja records
 */
const getPujaStats = async (year) => {
  const matchFilter = { isArchived: false };
  if (year) {
    matchFilter.year = Number(year);
  }

  const result = await PujaRecord.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        totalPeople: { $sum: '$numberOfPeople' },
        totalCouples: { $sum: '$numberOfCouples' },
        totalJamalCount: { $sum: '$jamalCount' },
        completedPujas: {
          $sum: { $cond: [{ $eq: ['$pujaStatus', 'completed'] }, 1, 0] },
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] },
        },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const stats = result[0] || {
    totalRecords: 0,
    totalPeople: 0,
    totalCouples: 0,
    totalJamalCount: 0,
    completedPujas: 0,
    pendingPayments: 0,
    totalAmount: 0,
  };

  // Distinct families count
  const distinctFamilies = await PujaRecord.distinct('familyName', {
    ...matchFilter,
    familyName: { $ne: '' },
  });
  stats.totalFamilies = distinctFamilies.length;

  return stats;
};

/**
 * Generates Year-wise summary breakdown for historical analytics
 */
const getYearlySummary = async () => {
  const summary = await PujaRecord.aggregate([
    { $match: { isArchived: false } },
    {
      $group: {
        _id: '$year',
        year: { $first: '$year' },
        records: { $sum: 1 },
        people: { $sum: '$numberOfPeople' },
        couples: { $sum: '$numberOfCouples' },
        jamalCount: { $sum: '$jamalCount' },
        completed: {
          $sum: { $cond: [{ $eq: ['$pujaStatus', 'completed'] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$pujaStatus', 'cancelled'] }, 1, 0] },
        },
        totalAmount: { $sum: '$amount' },
      },
    },
    { $sort: { year: -1 } },
  ]);

  return summary;
};

/**
 * Generates Month-wise summary breakdown for a specific year
 */
const getMonthlySummary = async (year = new Date().getFullYear()) => {
  const numericYear = Number(year) || new Date().getFullYear();

  const monthlyAgg = await PujaRecord.aggregate([
    {
      $match: {
        year: numericYear,
        isArchived: false,
      },
    },
    {
      $group: {
        _id: { $month: '$pujaDate' },
        records: { $sum: 1 },
        people: { $sum: '$numberOfPeople' },
        couples: { $sum: '$numberOfCouples' },
        jamalCount: { $sum: '$jamalCount' },
        amount: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthNames = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];

  // Return full 12-month array
  const fullMonths = Array.from({ length: 12 }, (_, index) => {
    const monthNum = index + 1;
    const found = monthlyAgg.find((m) => m._id === monthNum);
    return {
      month: monthNum,
      monthName: monthNames[index],
      records: found ? found.records : 0,
      people: found ? found.people : 0,
      couples: found ? found.couples : 0,
      jamalCount: found ? found.jamalCount : 0,
      amount: found ? found.amount : 0,
    };
  });

  return {
    year: numericYear,
    months: fullMonths,
  };
};

/**
 * Generates a clean CSV export for authorized users
 */
const generatePujaCsv = async (query = {}) => {
  const { records } = await getPujaRecords({ ...query, limit: 10000 });

  const headers = [
    'Record Number',
    'Year',
    'Puja Date',
    'Puja Type',
    'Primary Person',
    'Family Name',
    'Mobile',
    'Village',
    'City',
    'People Count',
    'Couples Count',
    'Jamal Count',
    'Status',
    'Payment Status',
    'Amount',
    'Payment Method',
    'Notes',
  ];

  const rows = records.map((r) => [
    `"${r.recordNumber || ''}"`,
    r.year || '',
    r.pujaDate ? new Date(r.pujaDate).toISOString().split('T')[0] : '',
    `"${r.pujaType || ''}"`,
    `"${(r.primaryPersonName || '').replace(/"/g, '""')}"`,
    `"${(r.familyName || '').replace(/"/g, '""')}"`,
    `"${r.mobile || ''}"`,
    `"${(r.village || '').replace(/"/g, '""')}"`,
    `"${(r.city || '').replace(/"/g, '""')}"`,
    r.numberOfPeople || 0,
    r.numberOfCouples || 0,
    r.jamalCount || 0,
    `"${r.pujaStatus || ''}"`,
    `"${r.paymentStatus || ''}"`,
    r.amount || 0,
    `"${r.paymentMethod || ''}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

/**
 * Public Puja Aggregate Summary (Strictly ZERO personal data leak)
 */
const getPublicPujaSummary = async (year) => {
  const matchFilter = { isArchived: false };
  if (year) matchFilter.year = Number(year);

  const stats = await PujaRecord.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$year',
        year: { $first: '$year' },
        totalRecords: { $sum: 1 },
        totalParticipants: { $sum: '$numberOfPeople' },
        totalCouples: { $sum: '$numberOfCouples' },
        totalJamalCount: { $sum: '$jamalCount' },
        completedPujas: {
          $sum: { $cond: [{ $eq: ['$pujaStatus', 'completed'] }, 1, 0] },
        },
      },
    },
    { $sort: { year: -1 } },
  ]);

  return stats;
};

module.exports = {
  createPujaRecord,
  getPujaRecords,
  getPujaRecordById,
  updatePujaRecord,
  archivePujaRecord,
  getPujaStats,
  getYearlySummary,
  getMonthlySummary,
  generatePujaCsv,
  getPublicPujaSummary,
};
