const Counter = require('../models/Counter');

/**
 * Receipt Number Generator Service - Phase 3
 * Generates audit-grade unique, sequential receipt numbers
 * Format: JKM-YYYY-XXXXXX (e.g., JKM-2026-000001)
 *
 * Uses MongoDB findOneAndUpdate with $inc for atomic concurrency safety
 */
const generateReceiptNumber = async (date = new Date()) => {
  const donationDate = date instanceof Date ? date : new Date(date);
  const year = donationDate.getFullYear();
  const counterKey = `receipt_${year}`;

  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const sequenceNumber = String(counter.seq).padStart(6, '0');
  return `JKM-${year}-${sequenceNumber}`;
};

module.exports = {
  generateReceiptNumber,
};
