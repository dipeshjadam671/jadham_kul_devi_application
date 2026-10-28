const mongoose = require('mongoose');

/**
 * Gallery Media Schema - Phase 4
 * Stores individual photo and video assets metadata with Firebase Storage path links
 */
const galleryMediaSchema = new mongoose.Schema(
  {
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GalleryAlbum',
      required: [true, 'Album ID is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Media type is required'],
      enum: {
        values: ['image', 'video'],
        message: '{VALUE} is not a valid media type (must be image or video)',
      },
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: '',
    },
    storagePath: {
      type: String,
      trim: true,
      default: '',
    },
    mimeType: {
      type: String,
      trim: true,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    duration: {
      type: Number, // In seconds (for videos)
      default: null,
    },
    eventDate: {
      type: Date,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GalleryMedia = mongoose.model('GalleryMedia', galleryMediaSchema);

module.exports = GalleryMedia;
