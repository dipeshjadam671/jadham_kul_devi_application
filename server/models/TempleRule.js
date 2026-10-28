const mongoose = require('mongoose');

/**
 * Temple Rule Schema - Phase 4
 * Stores code of conduct, sacred premises decorum, and worship rules (up to 15 slots)
 */
const templeRuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Rule title is required'],
      trim: true,
      maxlength: [300, 'Rule title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      min: [1, 'Rule order must be at least 1'],
      max: [15, 'Rule order cannot exceed 15'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const TempleRule = mongoose.model('TempleRule', templeRuleSchema);

module.exports = TempleRule;
