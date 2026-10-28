const mongoose = require('mongoose');

/**
 * Gallery Album Schema - Phase 4
 * Albums categorizing temple celebrations, rituals, construction, and events
 */
const galleryAlbumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Album name is required'],
      trim: true,
      maxlength: [150, 'Album name cannot exceed 150 characters'],
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
    description: {
      type: String,
      trim: true,
      default: '',
    },
    coverImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    eventDate: {
      type: Date,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Album category is required'],
      enum: {
        values: [
          'Navratri',
          'Ram Navami',
          'Temple Event',
          'Puja',
          'Yatra',
          'Festival',
          'General',
          'Other',
        ],
        message: '{VALUE} is not a valid album category',
      },
      default: 'General',
      index: true,
    },
    isPublished: {
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

const GalleryAlbum = mongoose.model('GalleryAlbum', galleryAlbumSchema);

module.exports = GalleryAlbum;
