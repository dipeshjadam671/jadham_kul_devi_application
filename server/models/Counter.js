const mongoose = require('mongoose');

/**
 * Counter Schema for atomic sequence generation
 * Used for sequential receipt numbers (e.g. JKM-2026-000001) without race conditions
 */
const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
