const Counter = require('../models/Counter');

/**
 * Yatra Registration Number Generator Service - Phase 5
 * Generates audit-grade unique, sequential registration numbers
 *
 * Formats:
 * - Ram Navami Yatra: RNY-YYYY-XXXXXX (e.g., RNY-2026-000001)
 * - Mansarovar Yatra: MSY-YYYY-XXXXXX (e.g., MSY-2026-000001)
 *
 * Uses MongoDB findOneAndUpdate with $inc for atomic concurrency safety
 */
const generateYatraRegistrationNumber = async (yatraType, date = new Date()) => {
  const travelDate = date instanceof Date ? date : new Date(date);
  const year = isNaN(travelDate.getFullYear()) ? new Date().getFullYear() : travelDate.getFullYear();
  
  const prefix = yatraType === 'RAM_NAVAMI' ? 'RNY' : 'MSY';
  const counterKey = `yatra_${prefix.toLowerCase()}_${year}`;

  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const sequenceNumber = String(counter.seq).padStart(6, '0');
  return `${prefix}-${year}-${sequenceNumber}`;
};

module.exports = {
  generateYatraRegistrationNumber,
};
