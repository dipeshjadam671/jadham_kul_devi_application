const RestrictedPerson = require('../models/RestrictedPerson');
const { generateRestrictedRecordNumber } = require('./restrictedRecordNumberService');

/**
 * Restricted Person Service - Phase 6
 * Encapsulates secure administrative logic for managing restricted person records.
 * 
 * CRITICAL PRIVACY & SECURITY:
 * All methods in this service must only be called from authenticated,
 * authorized admin endpoints. Never expose to public or unverified consumers.
 */

/**
 * Creates a new Restricted Person record
 */
const createRestrictedPerson = async (data, userId) => {
  const year = data.startDate ? new Date(data.startDate).getFullYear() : new Date().getFullYear();

  if (!data.name || !data.name.trim()) {
    throw new Error('Person name is required');
  }
  if (!data.reason || !data.reason.trim()) {
    throw new Error('Restriction reason is required');
  }

  const recordNumber = await generateRestrictedRecordNumber(year);

  const restrictedPerson = new RestrictedPerson({
    ...data,
    recordNumber,
    status: data.status || 'active',
    createdBy: userId || null,
    updatedBy: userId || null,
  });

  return await restrictedPerson.save();
};

/**
 * Retrieves paginated, filtered list of restricted records
 */
const getRestrictedPersons = async (query = {}) => {
  const {
    status,
    restrictionType,
    search,
    isArchived,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  if (isArchived === 'true' || isArchived === true) {
    filter.isArchived = true;
  } else if (isArchived === 'all') {
    // include both
  } else {
    filter.isArchived = false;
  }

  if (status) {
    filter.status = status;
  }

  if (restrictionType) {
    filter.restrictionType = restrictionType;
  }

  if (search && search.trim()) {
    const s = search.trim();
    const regex = new RegExp(s, 'i');
    filter.$or = [
      { recordNumber: regex },
      { name: regex },
      { mobile: regex },
      { village: regex },
      { city: regex },
      { reason: regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [rawRecords, total] = await Promise.all([
    RestrictedPerson.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name mobile')
      .populate('updatedBy', 'name mobile')
      .populate('revokedBy', 'name mobile')
      .lean(),
    RestrictedPerson.countDocuments(filter),
  ]);

  // Evaluate dynamic expiration without mutating DB on read
  const now = new Date();
  const records = rawRecords.map((r) => {
    let effectiveStatus = r.status;
    if (r.status === 'active' && r.endDate && new Date(r.endDate) < now) {
      effectiveStatus = 'expired';
    }
    return {
      ...r,
      effectiveStatus,
      isCurrentlyExpired: effectiveStatus === 'expired',
    };
  });

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
 * Retrieves a single restricted record by ID
 */
const getRestrictedPersonById = async (id) => {
  const record = await RestrictedPerson.findById(id)
    .populate('createdBy', 'name mobile')
    .populate('updatedBy', 'name mobile')
    .populate('revokedBy', 'name mobile');

  if (!record) {
    throw new Error('Restricted record not found');
  }

  const plain = record.toObject();
  const now = new Date();
  if (plain.status === 'active' && plain.endDate && new Date(plain.endDate) < now) {
    plain.effectiveStatus = 'expired';
    plain.isCurrentlyExpired = true;
  } else {
    plain.effectiveStatus = plain.status;
    plain.isCurrentlyExpired = false;
  }

  return plain;
};

/**
 * Updates a restricted record
 */
const updateRestrictedPerson = async (id, data, userId) => {
  delete data.recordNumber;
  delete data.createdBy;

  const updated = await RestrictedPerson.findByIdAndUpdate(
    id,
    {
      ...data,
      updatedBy: userId || null,
    },
    { new: true, runValidators: true }
  ).populate('createdBy updatedBy', 'name mobile');

  if (!updated) {
    throw new Error('Restricted record not found');
  }

  return updated;
};

/**
 * Revokes an active restriction with confirmation and reason
 */
const revokeRestriction = async (id, revocationReason, userId) => {
  const record = await RestrictedPerson.findById(id);

  if (!record) {
    throw new Error('Restricted record not found');
  }

  record.status = 'revoked';
  record.revocationReason = revocationReason || 'Administrative revocation';
  record.revokedAt = new Date();
  record.revokedBy = userId || null;
  record.updatedBy = userId || null;

  return await record.save();
};

/**
 * Soft archives a restricted record
 */
const archiveRestrictedPerson = async (id, userId) => {
  const record = await RestrictedPerson.findByIdAndUpdate(
    id,
    {
      isArchived: true,
      status: 'archived',
      updatedBy: userId || null,
    },
    { new: true }
  );

  if (!record) {
    throw new Error('Restricted record not found');
  }

  return record;
};

/**
 * Counts restricted records for dashboard KPI (counts only, no names)
 */
const getRestrictedCount = async () => {
  const now = new Date();

  const [total, active, expired, revoked] = await Promise.all([
    RestrictedPerson.countDocuments({ isArchived: false }),
    RestrictedPerson.countDocuments({
      isArchived: false,
      status: 'active',
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    }),
    RestrictedPerson.countDocuments({
      isArchived: false,
      $or: [
        { status: 'expired' },
        { status: 'active', endDate: { $lt: now } },
      ],
    }),
    RestrictedPerson.countDocuments({ isArchived: false, status: 'revoked' }),
  ]);

  return { total, active, expired, revoked };
};

/**
 * Generates CSV string for authorized exports
 */
const generateRestrictedCsv = async (query = {}) => {
  const { records } = await getRestrictedPersons({ ...query, limit: 10000 });

  const headers = [
    'Record Number',
    'Name',
    'Mobile',
    'Village',
    'City',
    'Restriction Type',
    'Status',
    'Start Date',
    'End Date',
    'Reason',
    'Notes',
  ];

  const rows = records.map((r) => [
    `"${r.recordNumber || ''}"`,
    `"${(r.name || '').replace(/"/g, '""')}"`,
    `"${r.mobile || ''}"`,
    `"${(r.village || '').replace(/"/g, '""')}"`,
    `"${(r.city || '').replace(/"/g, '""')}"`,
    `"${r.restrictionType || ''}"`,
    `"${r.effectiveStatus || r.status || ''}"`,
    r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
    r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
    `"${(r.reason || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

module.exports = {
  createRestrictedPerson,
  getRestrictedPersons,
  getRestrictedPersonById,
  updateRestrictedPerson,
  revokeRestriction,
  archiveRestrictedPerson,
  getRestrictedCount,
  generateRestrictedCsv,
};
