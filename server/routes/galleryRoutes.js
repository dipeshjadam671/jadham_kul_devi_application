const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/galleryController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const PERMISSIONS = require('../constants/permissions');

/**
 * Gallery Management Admin Routes - Phase 4
 */

router.use(authenticateUser);

// Albums
router.get('/albums', requirePermission(PERMISSIONS.GALLERY_VIEW), getAlbums);
router.post('/albums', requirePermission(PERMISSIONS.GALLERY_ALBUM_CREATE), createAlbum);
router.get('/albums/:id', requirePermission(PERMISSIONS.GALLERY_VIEW), getAlbumById);
router.put('/albums/:id', requirePermission(PERMISSIONS.GALLERY_ALBUM_UPDATE), updateAlbum);
router.delete('/albums/:id', requirePermission(PERMISSIONS.GALLERY_ALBUM_DELETE), deleteAlbum);

// Media
router.get('/media', requirePermission(PERMISSIONS.GALLERY_VIEW), getMedia);
router.post('/media', requirePermission(PERMISSIONS.GALLERY_MEDIA_UPLOAD), createMedia);
router.get('/media/:id', requirePermission(PERMISSIONS.GALLERY_VIEW), getMediaById);
router.put('/media/:id', requirePermission(PERMISSIONS.GALLERY_MEDIA_UPDATE), updateMedia);
router.patch('/media/:id/publish', requirePermission(PERMISSIONS.GALLERY_PUBLISH), togglePublishMedia);
router.delete('/media/:id', requirePermission(PERMISSIONS.GALLERY_MEDIA_DELETE), deleteMedia);

module.exports = router;
