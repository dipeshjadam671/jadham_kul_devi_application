const Counter = require('../models/Counter');

/**
 * Puja Record Number Generator Service - Phase 6
 * Generates audit-grade unique, sequential Puja record numbers
 *
 * Format: PUJA-YYYY-XXXXXX (e.g., PUJA-2026-000001)
 *
 * Uses MongoDB findOneAndUpdate with $inc for atomic concurrency safety
 */
const generatePujaRecordNumber = async (year = new Date().getFullYear()) => {
  const numericYear = Number(year) || new Date().getFullYear();
  const counterKey = `puja_record_${numericYear}`;

  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const sequenceNumber = String(counter.seq).padStart(6, '0');
  return `PUJA-${numericYear}-${sequenceNumber}`;
};

module.exports = {
  generatePujaRecordNumber,
};
