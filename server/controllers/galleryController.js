const GalleryAlbum = require('../models/GalleryAlbum');
const GalleryMedia = require('../models/GalleryMedia');
const { generateUniqueSlug } = require('../utils/slugify');

/**
 * Gallery Controller - Phase 4
 * Album organization and Photo/Video media metadata management
 */

// ================= ALBUMS ================= //

/**
 * Create a new album
 * POST /api/v1/gallery/albums
 */
const createAlbum = async (req, res) => {
  try {
    const { name, description, coverImageUrl, eventDate, category = 'General', isPublished = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Album name is required.',
        errors: ['name cannot be empty'],
      });
    }

    const slug = await generateUniqueSlug(GalleryAlbum, name.trim());

    const album = new GalleryAlbum({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      coverImageUrl: coverImageUrl ? coverImageUrl.trim() : '',
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      category,
      isPublished: Boolean(isPublished),
      createdBy: req.user._id,
    });

    await album.save();

    return res.status(201).json({
      success: true,
      message: 'Gallery album created successfully.',
      data: album,
    });
  } catch (error) {
    console.error('Error creating album:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create album.',
      errors: [error.message],
    });
  }
};

/**
 * Get paginated albums with media counts (Admin)
 * GET /api/v1/gallery/albums
 */
const getAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [albums, total] = await Promise.all([
      GalleryAlbum.find(query)
        .populate('createdBy', 'name mobile role')
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      GalleryAlbum.countDocuments(query),
    ]);

    // Attach media count for each album
    const albumIds = albums.map((a) => a._id);
    const mediaCounts = await GalleryMedia.aggregate([
      { $match: { albumId: { $in: albumIds } } },
      {
        $group: {
          _id: '$albumId',
          totalMedia: { $sum: 1 },
          photos: { $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] } },
          videos: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
        },
      },
    ]);

    const countMap = {};
    mediaCounts.forEach((c) => {
      countMap[c._id.toString()] = {
        total: c.totalMedia,
        photos: c.photos,
        videos: c.videos,
      };
    });

    const enrichedAlbums = albums.map((album) => ({
      ...album,
      mediaCount: countMap[album._id.toString()] || { total: 0, photos: 0, videos: 0 },
    }));

    return res.status(200).json({
      success: true,
      data: enrichedAlbums,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve albums.',
      errors: [error.message],
    });
  }
};

/**
 * Get album by ID with its media items
 * GET /api/v1/gallery/albums/:id
 */
const getAlbumById = async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.id)
      .populate('createdBy', 'name mobile role');

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found.',
      });
    }

    const mediaItems = await GalleryMedia.find({ albumId: album._id })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        ...album.toObject(),
        media: mediaItems,
        mediaCount: {
          total: mediaItems.length,
          photos: mediaItems.filter((m) => m.type === 'image').length,
          videos: mediaItems.filter((m) => m.type === 'video').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching album by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch album details.',
      errors: [error.message],
    });
  }
};

/**
 * Update album
 * PUT /api/v1/gallery/albums/:id
 */
const updateAlbum = async (req, res) => {
  try {
    const album = await GalleryAlbum.findById(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found.',
      });
    }

    const { name, description, coverImageUrl, eventDate, category, isPublished } = req.body;

    if (name && name.trim() && name.trim() !== album.name) {
      album.name = name.trim();
      album.slug = await generateUniqueSlug(GalleryAlbum, name.trim(), album._id);
    }

    if (description !== undefined) album.description = description.trim();
    if (coverImageUrl !== undefined) album.coverImageUrl = coverImageUrl.trim();
    if (eventDate !== undefined) album.eventDate = eventDate ? new Date(eventDate) : null;
    if (category !== undefined) album.category = category;
    if (isPublished !== undefined) album.isPublished = Boolean(isPublished);

    album.updatedBy = req.user._id;
    await album.save();

    return res.status(200).json({
      success: true,
      message: 'Album updated successfully.',
      data: album,
    });
  } catch (error) {
    console.error('Error updating album:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update album.',
      errors: [error.message],
    });
  }
};

/**
 * Delete album and its media
 * DELETE /api/v1/gallery/albums/:id
 */
const deleteAlbum = async (req, res) => {
  try {
    const album = await GalleryAlbum.findByIdAndDelete(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found.',
      });
    }

    // Delete associated media records
    await GalleryMedia.deleteMany({ albumId: album._id });

    return res.status(200).json({
      success: true,
      message: 'Album and all associated media deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting album:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete album.',
      errors: [error.message],
    });
  }
};

// ================= MEDIA ================= //

/**
 * Create media entry (metadata linking uploaded file to album)
 * POST /api/v1/gallery/media
 */
const createMedia = async (req, res) => {
  try {
    const {
      albumId,
      type,
      title,
      description,
      fileUrl,
      thumbnailUrl,
      storagePath,
      mimeType,
      fileSize,
      width,
      height,
      duration,
      eventDate,
      isPublished = true,
      sortOrder = 0,
    } = req.body;

    if (!albumId) {
      return res.status(400).json({
        success: false,
        message: 'albumId is required.',
      });
    }

    if (!type || !['image', 'video'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be image or video.',
      });
    }

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'fileUrl is required.',
      });
    }

    // Ensure album exists
    const album = await GalleryAlbum.findById(albumId);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Specified album does not exist.',
      });
    }

    const media = new GalleryMedia({
      albumId,
      type,
      title: title ? title.trim() : '',
      description: description ? description.trim() : '',
      fileUrl: fileUrl.trim(),
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : '',
      storagePath: storagePath ? storagePath.trim() : '',
      mimeType: mimeType || (type === 'image' ? 'image/jpeg' : 'video/mp4'),
      fileSize: Number(fileSize) || 0,
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      duration: duration ? Number(duration) : null,
      eventDate: eventDate ? new Date(eventDate) : album.eventDate || new Date(),
      isPublished: Boolean(isPublished),
      sortOrder: Number(sortOrder) || 0,
      uploadedBy: req.user._id,
    });

    await media.save();

    // If album doesn't have cover image, auto-assign this media's URL
    if (!album.coverImageUrl && type === 'image') {
      album.coverImageUrl = fileUrl;
      await album.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Media saved to album successfully.',
      data: media,
    });
  } catch (error) {
    console.error('Error creating media:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record media metadata.',
      errors: [error.message],
    });
  }
};

/**
 * Get media list with filtering (Admin)
 * GET /api/v1/gallery/media
 */
const getMedia = async (req, res) => {
  try {
    const { albumId, type, isPublished, page = 1, limit = 24 } = req.query;
    const query = {};

    if (albumId) query.albumId = albumId;
    if (type) query.type = type;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const [mediaItems, total] = await Promise.all([
      GalleryMedia.find(query)
        .populate('albumId', 'name slug category')
        .populate('uploadedBy', 'name role')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      GalleryMedia.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: mediaItems,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve media items.',
      errors: [error.message],
    });
  }
};

/**
 * Get media by ID
 * GET /api/v1/gallery/media/:id
 */
const getMediaById = async (req, res) => {
  try {
    const media = await GalleryMedia.findById(req.params.id)
      .populate('albumId', 'name slug category')
      .populate('uploadedBy', 'name role');

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error('Error fetching media by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch media record.',
      errors: [error.message],
    });
  }
};

/**
 * Update media metadata
 * PUT /api/v1/gallery/media/:id
 */
const updateMedia = async (req, res) => {
  try {
    const media = await GalleryMedia.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media record not found.',
      });
    }

    const { title, description, eventDate, isPublished, sortOrder } = req.body;

    if (title !== undefined) media.title = title.trim();
    if (description !== undefined) media.description = description.trim();
    if (eventDate !== undefined) media.eventDate = eventDate ? new Date(eventDate) : null;
    if (isPublished !== undefined) media.isPublished = Boolean(isPublished);
    if (sortOrder !== undefined) media.sortOrder = Number(sortOrder) || 0;

    await media.save();

    return res.status(200).json({
      success: true,
      message: 'Media record updated successfully.',
      data: media,
    });
  } catch (error) {
    console.error('Error updating media:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update media.',
      errors: [error.message],
    });
  }
};

/**
 * Toggle publish status of media
 * PATCH /api/v1/gallery/media/:id/publish
 */
const togglePublishMedia = async (req, res) => {
  try {
    const media = await GalleryMedia.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media record not found.',
      });
    }

    media.isPublished = !media.isPublished;
    await media.save();

    return res.status(200).json({
      success: true,
      message: media.isPublished ? 'Media published.' : 'Media unpublished.',
      data: media,
    });
  } catch (error) {
    console.error('Error toggling media publish state:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle media publish state.',
      errors: [error.message],
    });
  }
};

/**
 * Delete media
 * DELETE /api/v1/gallery/media/:id
 */
const deleteMedia = async (req, res) => {
  try {
    const media = await GalleryMedia.findByIdAndDelete(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Media deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete media.',
      errors: [error.message],
    });
  }
};

module.exports = {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  createMedia,
  getMedia,
  getMediaById,
  updateMedia,
  togglePublishMedia,
  deleteMedia,
};
