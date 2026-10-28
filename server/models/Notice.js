const mongoose = require('mongoose');

/**
 * Notice & Event Schema - Phase 4
 * Official announcements, festival schedules, meetings, and community notices
 */
const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    eventDate: {
      type: Date,
      index: true,
    },
    startTime: {
      type: String,
      trim: true,
      default: '',
    },
    endTime: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'मंदिर परिसर, नर्मदा तट, खलघाट',
    },
    bannerImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived', 'cancelled'],
        message: '{VALUE} is not a valid notice status',
      },
      default: 'draft',
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
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

// Pre-save hook: auto-set publishedAt if status transitions to published
noticeSchema.pre('save', function (next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
