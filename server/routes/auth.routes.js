const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { loginAdmin, getCurrentUser, syncUser } = require('../controllers/authController');

/**
 * @route   POST /api/v1/auth/login
 * @desc    Admin login with static User ID and Password
 * @access  Public
 */
router.post('/login', loginAdmin);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Private
 */
router.get('/me', authenticateUser, getCurrentUser);

/**
 * @route   POST /api/v1/auth/sync
 * @desc    Synchronize user profile upon login
 * @access  Private
 */
router.post('/sync', authenticateUser, syncUser);

module.exports = router;
