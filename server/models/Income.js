const mongoose = require('mongoose');

/**
 * Income Schema - Phase 3
 * Manages other non-donation temple revenue (e.g. events, rental, sponsorship)
 */
const incomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Income title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Income date is required'],
      default: Date.now,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['donation', 'event_income', 'rental', 'sponsorship', 'other'],
        message: '{VALUE} is not a valid income category',
      },
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cash', 'upi', 'bank_transfer', 'cheque', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      index: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
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

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
