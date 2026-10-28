const mongoose = require('mongoose');

/**
 * Couple Subdocument Schema
 */
const coupleSubSchema = new mongoose.Schema(
  {
    husbandName: {
      type: String,
      trim: true,
      default: '',
    },
    wifeName: {
      type: String,
      trim: true,
      default: '',
    },
    village: {
      type: String,
      trim: true,
      default: '',
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

/**
 * Jamal / Nikasi Detail Subdocument Schema
 * Represents temple-specific Jamal निकासी records without rigid hardcoded assumptions.
 */
const jamalDetailSubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    village: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: null,
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: 1,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

/**
 * PujaRecord Schema - Phase 6
 * Manages annual Mata Ji Puja, special Pujas, couple tracking, Jamal records,
 * participant families, and administrative workflows.
 */
const pujaRecordSchema = new mongoose.Schema(
  {
    recordNumber: {
      type: String,
      required: [true, 'Puja Record Number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Puja Year is required'],
      min: [2000, 'Year must be after 2000'],
      max: [2100, 'Year cannot exceed 2100'],
      index: true,
    },
    pujaDate: {
      type: Date,
      required: [true, 'Puja Date is required'],
      default: Date.now,
      index: true,
    },
    pujaType: {
      type: String,
      enum: {
        values: [
          'annual_puja',
          'special_puja',
          'navratri_puja',
          'ashtami_puja',
          'navami_puja',
          'other',
        ],
        message: '{VALUE} is not a valid Puja Type',
      },
      default: 'annual_puja',
      index: true,
    },
    familyName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Family name cannot exceed 100 characters'],
    },
    primaryPersonName: {
      type: String,
      required: [true, 'Primary person / यजमान name is required'],
      trim: true,
      maxlength: [100, 'Primary name cannot exceed 100 characters'],
    },
    mobile: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
    village: {
      type: String,
      trim: true,
      index: true,
      default: '',
      maxlength: [100, 'Village cannot exceed 100 characters'],
    },
    city: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    address: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    numberOfPeople: {
      type: Number,
      required: [true, 'Number of people is required'],
      min: [1, 'Number of people must be at least 1'],
      default: 1,
    },
    numberOfCouples: {
      type: Number,
      min: [0, 'Number of couples cannot be negative'],
      default: 0,
    },
    couples: {
      type: [coupleSubSchema],
      default: [],
    },
    jamalCount: {
      type: Number,
      min: [0, 'Jamal count cannot be negative'],
      default: 0,
    },
    jamalDetails: {
      type: [jamalDetailSubSchema],
      default: [],
    },
    jamalNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Jamal notes cannot exceed 500 characters'],
    },
    pujaStatus: {
      type: String,
      enum: {
        values: ['scheduled', 'registered', 'completed', 'cancelled', 'archived'],
        message: '{VALUE} is not a valid Puja Status',
      },
      default: 'registered',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'partial', 'paid', 'not_required', 'refunded'],
        message: '{VALUE} is not a valid Payment Status',
      },
      default: 'not_required',
      index: true,
    },
    amount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'other', 'none'],
      default: 'cash',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-speed queries, filters, and reports
pujaRecordSchema.index({ year: 1, isArchived: 1, pujaStatus: 1 });
pujaRecordSchema.index({ pujaDate: -1, isArchived: 1 });
pujaRecordSchema.index({ mobile: 1, year: 1 });
pujaRecordSchema.index({ village: 1, year: 1 });

// Full text index for multi-field backend search
pujaRecordSchema.index(
  {
    recordNumber: 'text',
    primaryPersonName: 'text',
    familyName: 'text',
    village: 'text',
    city: 'text',
  },
  {
    weights: {
      recordNumber: 5,
      primaryPersonName: 3,
      familyName: 2,
      village: 1,
    },
    name: 'puja_text_search_index',
  }
);

const PujaRecord = mongoose.model('PujaRecord', pujaRecordSchema);

module.exports = PujaRecord;
