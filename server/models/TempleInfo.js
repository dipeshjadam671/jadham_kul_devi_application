const mongoose = require('mongoose');

/**
 * Temple Information Schema - Phase 4
 * Singleton document storing official temple identity, introduction,
 * sacred Mata Ji history, address, weekly timings, and media branding.
 */
const templeTimingDaySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    dayHindi: {
      type: String,
      default: '',
    },
    morningOpen: {
      type: String,
      default: '05:30 AM',
    },
    morningClose: {
      type: String,
      default: '12:30 PM',
    },
    eveningOpen: {
      type: String,
      default: '04:30 PM',
    },
    eveningClose: {
      type: String,
      default: '09:00 PM',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const templeInfoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Temple title is required'],
      trim: true,
      default: 'जादम परिवार कुलदेवी मंदिर, खलघाट',
    },
    shortDescription: {
      type: String,
      trim: true,
      default: 'पवित्र नर्मदा तट पर स्थापित जादम कुल की कुलदेवी मां का पावन धाम',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    templeIntroduction: {
      type: String,
      trim: true,
      default: '',
    },
    history: {
      type: String,
      trim: true,
      default: '',
    },
    mataJiHistory: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'नर्मदा तट, खलघाट, मध्य प्रदेश',
    },
    address: {
      type: String,
      trim: true,
      default: 'जादम परिवार कुलदेवी मंदिर, नर्मदा घाट मार्ग, खलघाट',
    },
    village: {
      type: String,
      trim: true,
      default: 'खलघाट',
    },
    city: {
      type: String,
      trim: true,
      default: 'धामनोद / खलघाट',
    },
    district: {
      type: String,
      trim: true,
      default: 'धार',
    },
    state: {
      type: String,
      trim: true,
      default: 'मध्य प्रदेश',
    },
    pincode: {
      type: String,
      trim: true,
      default: '454552',
    },
    contactMobile: {
      type: String,
      trim: true,
      default: '+91 9977788693',
    },
    contactEmail: {
      type: String,
      trim: true,
      default: 'dipeshjadam671@gmail.com',
    },
    googleMapsUrl: {
      type: String,
      trim: true,
      default: 'https://maps.google.com/?q=Khalghat+Narmada+Ghat',
    },
    coverImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    logoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    templeTimings: {
      days: {
        type: [templeTimingDaySchema],
        default: [
          { day: 'Monday', dayHindi: 'सोमवार', morningOpen: '05:30 AM', morningClose: '12:30 PM', eveningOpen: '04:30 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Tuesday', dayHindi: 'मंगलवार', morningOpen: '05:30 AM', morningClose: '12:30 PM', eveningOpen: '04:30 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Wednesday', dayHindi: 'बुधवार', morningOpen: '05:30 AM', morningClose: '12:30 PM', eveningOpen: '04:30 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Thursday', dayHindi: 'गुरुवार', morningOpen: '05:30 AM', morningClose: '12:30 PM', eveningOpen: '04:30 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Friday', dayHindi: 'शुक्रवार', morningOpen: '05:30 AM', morningClose: '12:30 PM', eveningOpen: '04:30 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Saturday', dayHindi: 'शनिवार', morningOpen: '05:30 AM', morningClose: '12:30 PM', eveningOpen: '04:30 PM', eveningClose: '09:00 PM', isOpen: true },
          { day: 'Sunday', dayHindi: 'रविवार', morningOpen: '05:30 AM', morningClose: '01:00 PM', eveningOpen: '04:00 PM', eveningClose: '09:30 PM', isOpen: true },
        ],
      },
      morningAarti: {
        type: String,
        default: '06:00 AM',
      },
      sandhyaAarti: {
        type: String,
        default: '07:30 PM',
      },
      shayanAarti: {
        type: String,
        default: '08:45 PM',
      },
      specialNote: {
        type: String,
        default: 'नवरात्रि एवं विशेष पूर्णिमा पर्व पर मंदिर पट 24 घंटे दर्शन हेतु खुले रहते हैं।',
      },
      festivalTimings: {
        type: String,
        default: 'नवरात्रि, रामनवमी एवं विशेष उत्सवों पर दर्शन समय में विस्तार किया जाता है।',
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
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

const TempleInfo = mongoose.model('TempleInfo', templeInfoSchema);

module.exports = TempleInfo;
