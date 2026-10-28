const Notice = require('../models/Notice');
const GalleryAlbum = require('../models/GalleryAlbum');
const GalleryMedia = require('../models/GalleryMedia');

/**
 * Public Content Controller - Phase 4
 * Serves sanitized, public-only content for the temple website.
 * Drafts, archived items, and private metadata are strictly excluded.
 */

/**
 * Get Public Published Notices
 * GET /api/v1/public/notices
 */
const getPublicNotices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, filter, year, month } = req.query;

    const query = {
      status: 'published',
      isPublic: true,
    };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { location: searchRegex }];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      query.eventDate = { $gte: today };
    } else if (filter === 'past') {
      query.eventDate = { $lt: today };
    }

    if (year) {
      const y = parseInt(year, 10);
      let start, end;
      if (month) {
        const m = parseInt(month, 10) - 1;
        start = new Date(y, m, 1);
        end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      } else {
        start = new Date(y, 0, 1);
        end = new Date(y, 11, 31, 23, 59, 59, 999);
      }
      query.eventDate = { $gte: start, $lte: end };
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    // Prioritize pinned notices, then eventDate / publishedAt
    const [notices, total] = await Promise.all([
      Notice.find(query)
        .select('_id title slug shortDescription description eventDate startTime endTime location bannerImageUrl isPinned publishedAt')
        .sort({ isPinned: -1, eventDate: -1, publishedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Notice.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: notices,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getPublicNotices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notices.',
      errors: [error.message],
    });
  }
};

/**
 * Get Single Published Notice by Slug
 * GET /api/v1/public/notices/:slug
 */
const getPublicNoticeBySlug = async (req, res) => {
  try {
    const notice = await Notice.findOne({
      slug: req.params.slug,
      status: 'published',
      isPublic: true,
    })
      .select('_id title slug shortDescription description eventDate startTime endTime location bannerImageUrl isPinned publishedAt')
      .lean();

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found or is no longer published.',
      });
    }

    return res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Error in getPublicNoticeBySlug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notice details.',
      errors: [error.message],
    });
  }
};

/**
 * Get Published Gallery Albums
 * GET /api/v1/public/gallery/albums
 */
const getPublicAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;

    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    if (search && search.trim()) {
      query.name = new RegExp(search.trim(), 'i');
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    const [albums, total] = await Promise.all([
      GalleryAlbum.find(query)
        .select('_id name slug description coverImageUrl eventDate category')
        .sort({ eventDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      GalleryAlbum.countDocuments(query),
    ]);

    // Attach published media counts
    const albumIds = albums.map((a) => a._id);
    const mediaCounts = await GalleryMedia.aggregate([
      { $match: { albumId: { $in: albumIds }, isPublished: true } },
      {
        $group: {
          _id: '$albumId',
          total: { $sum: 1 },
          photos: { $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] } },
          videos: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
        },
      },
    ]);

    const countMap = {};
    mediaCounts.forEach((c) => {
      countMap[c._id.toString()] = {
        total: c.total,
        photos: c.photos,
        videos: c.videos,
      };
    });

    const enriched = albums.map((album) => ({
      ...album,
      mediaCount: countMap[album._id.toString()] || { total: 0, photos: 0, videos: 0 },
    }));

    return res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getPublicAlbums:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve albums.',
      errors: [error.message],
    });
  }
};

/**
 * Get Published Album and its Media by Slug
 * GET /api/v1/public/gallery/albums/:slug
 */
const getPublicAlbumBySlug = async (req, res) => {
  try {
    const album = await GalleryAlbum.findOne({
      slug: req.params.slug,
      isPublished: true,
    })
      .select('_id name slug description coverImageUrl eventDate category')
      .lean();

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found or is unpublished.',
      });
    }

    const mediaItems = await GalleryMedia.find({
      albumId: album._id,
      isPublished: true,
    })
      .select('_id type title description fileUrl thumbnailUrl mimeType width height duration eventDate sortOrder')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        ...album,
        media: mediaItems,
        mediaCount: {
          total: mediaItems.length,
          photos: mediaItems.filter((m) => m.type === 'image').length,
          videos: mediaItems.filter((m) => m.type === 'video').length,
        },
      },
    });
  } catch (error) {
    console.error('Error in getPublicAlbumBySlug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve album media.',
      errors: [error.message],
    });
  }
};

/**
 * Get Latest Published Media Across All Albums (e.g. for homepage preview)
 * GET /api/v1/public/gallery/media
 */
const getPublicMedia = async (req, res) => {
  try {
    const { limit = 24, type } = req.query;
    const query = { isPublished: true };

    if (type) {
      query.type = type;
    }

    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const mediaItems = await GalleryMedia.find(query)
      .populate('albumId', 'name slug category')
      .select('_id albumId type title description fileUrl thumbnailUrl mimeType width height duration eventDate')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      data: mediaItems,
    });
  } catch (error) {
    console.error('Error in getPublicMedia:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve gallery media.',
      errors: [error.message],
    });
  }
};

module.exports = {
  getPublicNotices,
  getPublicNoticeBySlug,
  getPublicAlbums,
  getPublicAlbumBySlug,
  getPublicMedia,
};
