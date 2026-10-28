const multer = require('multer');
const { uploadMediaFile, MAX_VIDEO_SIZE } = require('../services/uploadService');

// Multer in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_VIDEO_SIZE, // 100 MB ceiling
  },
});

/**
 * Handle Media File Upload
 * POST /api/v1/upload
 */
const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded.',
        errors: ['Please select a file to upload'],
      });
    }

    const folder = req.body.folder || 'gallery';
    const watermark = req.body.watermark === 'true';

    const result = await uploadMediaFile(req.file, folder, { watermark });

    return res.status(200).json({
      success: true,
      message: `${result.type === 'image' ? 'Image' : 'Video'} uploaded successfully.`,
      data: result,
    });
  } catch (error) {
    console.error('Error in handleUpload:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed.',
      errors: [error.message],
    });
  }
};

module.exports = {
  upload,
  handleUpload,
};
