const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { getFirebaseStorageBucket } = require('../config/firebaseAdmin');

/**
 * Upload Service - Phase 4
 * Validates, uploads, and generates public URLs for image and video assets.
 * Uses Firebase Storage in production with seamless local disk fallback for offline/development.
 */

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * Validate file type, extension, and size
 */
const validateMediaFile = (file) => {
  if (!file || !file.buffer) {
    throw new Error('No file data provided');
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isImage = ALLOWED_IMAGE_TYPES.includes(mime) && ALLOWED_IMAGE_EXTS.includes(ext);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mime) && ALLOWED_VIDEO_EXTS.includes(ext);

  if (!isImage && !isVideo) {
    throw new Error(
      `Unsupported file format: ${ext} (${mime}). Allowed images: jpg, jpeg, png, webp. Allowed videos: mp4, webm, mov.`
    );
  }

  const mediaType = isImage ? 'image' : 'video';
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  if (file.size > maxSize) {
    const maxMb = maxSize / (1024 * 1024);
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds limit of ${maxMb} MB for ${mediaType}.`);
  }

  return { mediaType, ext, mime };
};

/**
 * Upload file buffer to Firebase Storage or local fallback
 */
const uploadMediaFile = async (file, folder = 'gallery', options = {}) => {
  const { mediaType, ext, mime } = validateMediaFile(file);
  const fileHash = crypto.randomBytes(8).toString('hex');
  const safeName = `${Date.now()}_${fileHash}${ext}`;
  const storagePath = `${folder}/${mediaType}s/${safeName}`;

  const bucket = getFirebaseStorageBucket();

  // 1. Attempt upload to Firebase Storage if bucket is configured
  if (bucket) {
    try {
      const fileRef = bucket.file(storagePath);
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: mime,
          metadata: {
            originalName: file.originalname,
            watermarked: options.watermark ? 'true' : 'false',
            watermarkText: options.watermark ? 'जादम परिवार कुलदेवी मंदिर, खलघाट' : '',
          },
        },
        public: true,
      });

      // Construct public download URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      return {
        fileUrl: publicUrl,
        storagePath,
        mimeType: mime,
        fileSize: file.size,
        type: mediaType,
        provider: 'firebase',
      };
    } catch (fbError) {
      console.warn('⚠️ Firebase Storage upload failed, utilizing local fallback:', fbError.message);
    }
  }

  // 2. Local disk fallback for local dev / offline testing
  const localUploadsDir = path.join(__dirname, '../public/uploads', folder, `${mediaType}s`);
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }

  const localFilePath = path.join(localUploadsDir, safeName);
  fs.writeFileSync(localFilePath, file.buffer);

  const localFileUrl = `/uploads/${folder}/${mediaType}s/${safeName}`;

  return {
    fileUrl: localFileUrl,
    storagePath,
    mimeType: mime,
    fileSize: file.size,
    type: mediaType,
    provider: 'local',
  };
};

module.exports = {
  validateMediaFile,
  uploadMediaFile,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
};
