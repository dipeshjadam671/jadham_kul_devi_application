const mongoose = require('mongoose');

/**
 * RestrictedPerson Schema - Phase 6
 * Manages private administrative records of restricted persons.
 * 
 * CRITICAL PRIVACY RULE:
 * This collection is 100% PRIVATE.
 * NEVER expose this collection through public endpoints, search engines,
 * sitemaps, homepage, public gallery, or client bundles.
 */
const restrictedPersonSchema = new mongoose.Schema(
  {
    recordNumber: {
      type: String,
      required: [true, 'Record Number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Person Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
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
    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    reason: {
      type: String,
      required: [true, 'Restriction reason is required'],
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    restrictionType: {
      type: String,
      enum: {
        values: [
          'temporary_restriction',
          'permanent_restriction',
          'event_specific',
          'other',
        ],
        message: '{VALUE} is not a valid restriction type',
      },
      default: 'temporary_restriction',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'expired', 'revoked', 'archived'],
        message: '{VALUE} is not a valid restriction status',
      },
      default: 'active',
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
      index: true,
    },
    revocationReason: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Revocation reason cannot exceed 500 characters'],
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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

// Compound indexes for administrative search
restrictedPersonSchema.index({ status: 1, isArchived: 1 });
restrictedPersonSchema.index({ mobile: 1, status: 1 });
restrictedPersonSchema.index({ village: 1, status: 1 });

/**
 * Evaluates whether an active restriction has passed its end date
 */
restrictedPersonSchema.methods.checkAndUpdateExpiration = function () {
  if (
    this.status === 'active' &&
    this.endDate &&
    new Date(this.endDate) < new Date()
  ) {
    return 'expired';
  }
  return this.status;
};

const RestrictedPerson = mongoose.model('RestrictedPerson', restrictedPersonSchema);

module.exports = RestrictedPerson;
