const express = require('express');
const router = express.Router();
const {
  getPublicNotices,
  getPublicNoticeBySlug,
  getPublicAlbums,
  getPublicAlbumBySlug,
  getPublicMedia,
} = require('../controllers/publicContentController');

/**
 * Public Content Routes - Phase 4
 * No authentication required. Strict published-only filter.
 */

// Notices
router.get('/notices', getPublicNotices);
router.get('/notices/:slug', getPublicNoticeBySlug);

// Gallery
router.get('/gallery/albums', getPublicAlbums);
router.get('/gallery/albums/:slug', getPublicAlbumBySlug);
router.get('/gallery/media', getPublicMedia);
router.get('/albums', getPublicAlbums);
router.get('/albums/:slug', getPublicAlbumBySlug);
router.get('/media', getPublicMedia);

module.exports = router;
