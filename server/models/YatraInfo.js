const mongoose = require('mongoose');

/**
 * Yatra Information & Instructions Schema - Phase 5
 * Admin-managed operational content, reporting times, departure locations,
 * and essential travel rules for Ram Navami & Mansarovar Yatras.
 */
const yatraInfoSchema = new mongoose.Schema(
  {
    yatraType: {
      type: String,
      required: [true, 'Yatra type is required'],
      unique: true,
      enum: {
        values: ['RAM_NAVAMI', 'MANSAROVAR'],
        message: '{VALUE} is not a valid Yatra type',
      },
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    instructions: {
      type: [String],
      default: [],
    },
    guidelines: {
      type: String,
      trim: true,
      default: '',
    },
    departureGuidelines: {
      type: String,
      trim: true,
      default: '',
    },
    departureLocation: {
      type: String,
      trim: true,
      default: 'श्री जादम कुलदेवी मंदिर प्रांगण, खलघाट',
    },
    destination: {
      type: String,
      trim: true,
      default: '',
    },
    reportingTime: {
      type: String,
      trim: true,
      default: 'प्रातः 06:00 AM',
    },
    feePerPerson: {
      type: Number,
      min: [0, 'Fee cannot be negative'],
      default: 0,
    },
    isRegistrationOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    contactPersons: [
      {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        designation: { type: String, trim: true },
      },
    ],
    contactMobile: {
      type: String,
      trim: true,
      default: '+91 9826012345',
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
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

const YatraInfo = mongoose.model('YatraInfo', yatraInfoSchema);

module.exports = YatraInfo;
