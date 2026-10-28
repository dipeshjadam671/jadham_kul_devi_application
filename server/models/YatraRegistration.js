const mongoose = require('mongoose');

/**
 * Traveler Subdocument Schema - Phase 5
 * Stores family / co-traveler information without unnecessary sensitive identity data.
 * Full Aadhaar is NEVER stored (only optional last 4 digits).
 */
const travelerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Traveler name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120'],
      default: null,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a valid gender',
      },
      default: 'male',
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    village: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    idType: {
      type: String,
      enum: {
        values: ['aadhaar', 'voter_id', 'pan', 'driving_license', 'passport', 'other', 'none'],
        message: '{VALUE} is not a valid ID type',
      },
      default: 'none',
    },
    idLastFourDigits: {
      type: String,
      trim: true,
      maxlength: [4, 'ID digits cannot exceed 4 characters'],
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
 * Yatra Registration Schema - Phase 5
 * Complete registration records for Ram Navami Yatra & Mansarovar Yatra
 */
const yatraRegistrationSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    yatraType: {
      type: String,
      required: [true, 'Yatra type is required'],
      enum: {
        values: ['RAM_NAVAMI', 'MANSAROVAR'],
        message: '{VALUE} is not a valid Yatra type (must be RAM_NAVAMI or MANSAROVAR)',
      },
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Registration year is required'],
      index: true,
    },
    primaryName: {
      type: String,
      required: [true, 'Primary person/family head name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
      index: true,
    },
    mobile: {
      type: String,
      required: [true, 'Primary mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
      index: true,
    },
    village: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
      index: true,
    },
    numberOfTravelers: {
      type: Number,
      required: [true, 'Number of travelers is required'],
      min: [1, 'At least 1 traveler is required'],
      max: [50, 'Maximum 50 travelers permitted per registration'],
      default: 1,
    },
    travelers: {
      type: [travelerSchema],
      default: [],
    },
    bookingStatus: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled', 'completed', 'waitlisted'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'partial', 'paid', 'refunded', 'not_required'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
      index: true,
    },
    paymentAmount: {
      type: Number,
      min: [0, 'Payment amount cannot be negative'],
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'upi', 'bank_transfer', 'cheque', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'cash',
    },
    transactionId: {
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

    // Mansarovar Yatra specific fields
    travelOrganizer: {
      type: String,
      trim: true,
      default: '',
    },
    organizerMobile: {
      type: String,
      trim: true,
      default: '',
    },
    departureLocation: {
      type: String,
      trim: true,
      default: 'श्री जादम कुलदेवी मंदिर प्रांगण, खलघाट',
    },
    expectedReturnDate: {
      type: Date,
      default: null,
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

// Compound indexes for optimal search and aggregation performance
yatraRegistrationSchema.index({ year: 1, yatraType: 1, bookingStatus: 1 });
yatraRegistrationSchema.index({ mobile: 1, yatraType: 1, year: 1 });
yatraRegistrationSchema.index({ travelDate: 1, yatraType: 1 });

/**
 * Return privacy-safe public view (masks phone, omits internal notes and IDs)
 */
yatraRegistrationSchema.methods.getPublicView = function () {
  const maskedMobile = this.mobile ? `${this.mobile.slice(0, 5)}XXXXX` : '';
  return {
    registrationNumber: this.registrationNumber,
    yatraType: this.yatraType,
    year: this.year,
    primaryName: this.primaryName,
    mobileMasked: maskedMobile,
    village: this.village,
    city: this.city,
    travelDate: this.travelDate,
    numberOfTravelers: this.numberOfTravelers,
    bookingStatus: this.bookingStatus,
    paymentStatus: this.paymentStatus,
    departureLocation: this.departureLocation,
    createdAt: this.createdAt,
  };
};

const YatraRegistration = mongoose.model('YatraRegistration', yatraRegistrationSchema);

module.exports = YatraRegistration;
