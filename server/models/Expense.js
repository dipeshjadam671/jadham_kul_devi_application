const mongoose = require('mongoose');

/**
 * Expense Schema - Phase 3
 * Manages temple operational, construction, festival, and maintenance expenditures
 */
const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
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
      required: [true, 'Expense date is required'],
      default: Date.now,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'temple_maintenance',
          'electricity',
          'water',
          'construction',
          'decoration',
          'event',
          'travel',
          'food',
          'cleaning',
          'salary',
          'equipment',
          'other',
        ],
        message: '{VALUE} is not a valid expense category',
      },
      index: true,
    },
    vendor: {
      type: String,
      trim: true,
      default: '',
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
    billImageUrl: {
      type: String,
      trim: true,
      default: '',
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

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
