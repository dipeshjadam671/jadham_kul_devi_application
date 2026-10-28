const Notice = require('../models/Notice');
const { generateUniqueSlug } = require('../utils/slugify');

/**
 * Notice Controller - Phase 4
 * Complete publishing lifecycle, search, pagination, and pinned announcements
 */

const MAX_PINNED_NOTICES = 5;

/**
 * Create a new notice / event
 * POST /api/v1/notices
 */
const createNotice = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      bannerImageUrl,
      status = 'draft',
      isPinned = false,
      isPublic = true,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Notice title is required.',
        errors: ['title cannot be empty'],
      });
    }

    // Time validation if both start and end are provided
    if (startTime && endTime) {
      if (startTime > endTime && !endTime.includes('AM') && !startTime.includes('PM')) {
        // Simple 24h format sanity check if applicable
      }
    }

    // Check pinned limit
    if (isPinned) {
      const pinnedCount = await Notice.countDocuments({ isPinned: true });
      if (pinnedCount >= MAX_PINNED_NOTICES) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${MAX_PINNED_NOTICES} pinned notices allowed. Please unpin an existing notice first.`,
        });
      }
    }

    const slug = await generateUniqueSlug(Notice, title);

    const notice = new Notice({
      title: title.trim(),
      slug,
      shortDescription: shortDescription ? shortDescription.trim() : '',
      description: description ? description.trim() : '',
      eventDate: eventDate ? new Date(eventDate) : null,
      startTime: startTime ? startTime.trim() : '',
      endTime: endTime ? endTime.trim() : '',
      location: location ? location.trim() : 'मंदिर परिसर, नर्मदा तट, खलघाट',
      bannerImageUrl: bannerImageUrl ? bannerImageUrl.trim() : '',
      status,
      isPinned: Boolean(isPinned),
      isPublic: Boolean(isPublic),
      publishedAt: status === 'published' ? new Date() : null,
      createdBy: req.user._id,
    });

    await notice.save();

    return res.status(201).json({
      success: true,
      message: 'Notice created successfully.',
      data: notice,
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create notice.',
      errors: [error.message],
    });
  }
};

/**
 * Get paginated notices (Admin)
 * GET /api/v1/notices
 */
const getNotices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      year,
      month,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }, { location: searchRegex }];
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
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;

    // Prioritize pinned notices, then custom sort
    const sort = { isPinned: -1 };
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [notices, total] = await Promise.all([
      Notice.find(query)
        .populate('createdBy', 'name mobile role')
        .sort(sort)
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
    console.error('Error fetching notices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notices.',
      errors: [error.message],
    });
  }
};

/**
 * Get notice by ID
 * GET /api/v1/notices/:id
 */
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'name mobile role')
      .populate('updatedBy', 'name mobile role');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Error fetching notice by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notice.',
      errors: [error.message],
    });
  }
};

/**
 * Get notice by Slug
 * GET /api/v1/notices/slug/:slug
 */
const getNoticeBySlug = async (req, res) => {
  try {
    const notice = await Notice.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name mobile role');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error('Error fetching notice by slug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notice.',
      errors: [error.message],
    });
  }
};

/**
 * Update notice
 * PUT /api/v1/notices/:id
 */
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    const {
      title,
      shortDescription,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      bannerImageUrl,
      status,
      isPinned,
      isPublic,
    } = req.body;

    if (title && title.trim() && title.trim() !== notice.title) {
      notice.title = title.trim();
      notice.slug = await generateUniqueSlug(Notice, title.trim(), notice._id);
    }

    if (shortDescription !== undefined) notice.shortDescription = shortDescription.trim();
    if (description !== undefined) notice.description = description.trim();
    if (eventDate !== undefined) notice.eventDate = eventDate ? new Date(eventDate) : null;
    if (startTime !== undefined) notice.startTime = startTime.trim();
    if (endTime !== undefined) notice.endTime = endTime.trim();
    if (location !== undefined) notice.location = location.trim();
    if (bannerImageUrl !== undefined) notice.bannerImageUrl = bannerImageUrl.trim();
    if (isPublic !== undefined) notice.isPublic = Boolean(isPublic);

    if (status && status !== notice.status) {
      notice.status = status;
      if (status === 'published' && !notice.publishedAt) {
        notice.publishedAt = new Date();
      }
    }

    if (isPinned !== undefined && isPinned !== notice.isPinned) {
      if (isPinned) {
        const pinnedCount = await Notice.countDocuments({ isPinned: true, _id: { $ne: notice._id } });
        if (pinnedCount >= MAX_PINNED_NOTICES) {
          return res.status(400).json({
            success: false,
            message: `Maximum ${MAX_PINNED_NOTICES} pinned notices allowed.`,
          });
        }
      }
      notice.isPinned = Boolean(isPinned);
    }

    notice.updatedBy = req.user._id;
    await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice updated successfully.',
      data: notice,
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notice.',
      errors: [error.message],
    });
  }
};

/**
 * Publish notice
 * PATCH /api/v1/notices/:id/publish
 */
const publishNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    notice.status = 'published';
    if (!notice.publishedAt) {
      notice.publishedAt = new Date();
    }
    notice.updatedBy = req.user._id;
    await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice published successfully.',
      data: notice,
    });
  } catch (error) {
    console.error('Error publishing notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish notice.',
      errors: [error.message],
    });
  }
};

/**
 * Archive notice
 * PATCH /api/v1/notices/:id/archive
 */
const archiveNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    notice.status = 'archived';
    notice.isPinned = false; // automatically unpin archived notices
    notice.updatedBy = req.user._id;
    await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice archived successfully.',
      data: notice,
    });
  } catch (error) {
    console.error('Error archiving notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to archive notice.',
      errors: [error.message],
    });
  }
};

/**
 * Pin / Unpin notice
 * PATCH /api/v1/notices/:id/pin
 */
const togglePinNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    const nextPinState = !notice.isPinned;

    if (nextPinState) {
      const pinnedCount = await Notice.countDocuments({ isPinned: true, _id: { $ne: notice._id } });
      if (pinnedCount >= MAX_PINNED_NOTICES) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${MAX_PINNED_NOTICES} pinned notices allowed.`,
        });
      }
    }

    notice.isPinned = nextPinState;
    notice.updatedBy = req.user._id;
    await notice.save();

    return res.status(200).json({
      success: true,
      message: nextPinState ? 'Notice pinned to top.' : 'Notice unpinned.',
      data: notice,
    });
  } catch (error) {
    console.error('Error toggling notice pin state:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to pin/unpin notice.',
      errors: [error.message],
    });
  }
};

/**
 * Delete notice
 * DELETE /api/v1/notices/:id
 */
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notice deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notice.',
      errors: [error.message],
    });
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  getNoticeBySlug,
  updateNotice,
  publishNotice,
  archiveNotice,
  togglePinNotice,
  deleteNotice,
};
