const Counter = require('../models/Counter');

/**
 * Restricted Record Number Generator Service - Phase 6
 * Generates audit-grade unique, sequential Restricted Person record numbers
 *
 * Format: RES-YYYY-XXXXXX (e.g., RES-2026-000001)
 *
 * Uses MongoDB findOneAndUpdate with $inc for atomic concurrency safety
 */
const generateRestrictedRecordNumber = async (year = new Date().getFullYear()) => {
  const numericYear = Number(year) || new Date().getFullYear();
  const counterKey = `restricted_record_${numericYear}`;

  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const sequenceNumber = String(counter.seq).padStart(6, '0');
  return `RES-${numericYear}-${sequenceNumber}`;
};

module.exports = {
  generateRestrictedRecordNumber,
};
