const express = require('express');
const router = express.Router();
const {
  createNotice,
  getNotices,
  getNoticeById,
  getNoticeBySlug,
  updateNotice,
  publishNotice,
  archiveNotice,
  togglePinNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Notice Management Admin Routes - Phase 4
 */

router.use(authenticateUser);

// List & Create
router.get('/', requirePermission(PERMISSIONS.NOTICE_VIEW), getNotices);
router.post('/', requirePermission(PERMISSIONS.NOTICE_CREATE), createNotice);

// Fetch single by ID or Slug
router.get('/slug/:slug', requirePermission(PERMISSIONS.NOTICE_VIEW), getNoticeBySlug);
router.get('/:id', requirePermission(PERMISSIONS.NOTICE_VIEW), getNoticeById);

// Update, Publish, Archive, Pin, Delete
router.put('/:id', requirePermission(PERMISSIONS.NOTICE_UPDATE), updateNotice);
router.patch('/:id/publish', requirePermission(PERMISSIONS.NOTICE_PUBLISH), publishNotice);
router.patch('/:id/archive', requirePermission(PERMISSIONS.NOTICE_ARCHIVE), archiveNotice);
router.patch('/:id/pin', requirePermission(PERMISSIONS.NOTICE_UPDATE), togglePinNotice);
router.delete('/:id', requirePermission(PERMISSIONS.NOTICE_DELETE), deleteNotice);

module.exports = router;
