const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Auth Controller - Static Admin Authentication & JWT
 */

/**
 * @desc    Login Admin using static User ID and Password
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const inputUsername = (req.body.username || req.body.userId || req.body.mobile || '').trim().toLowerCase();
    const inputPassword = (req.body.password || '').trim();

    if (!inputUsername || !inputPassword) {
      return sendError(
        res,
        'कृपया यूज़र आईडी और पासवर्ड दर्ज करें (Username and Password are required)',
        ['Missing username or password'],
        400
      );
    }

    const configuredUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    const configuredPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();

    // Verify static admin credentials
    const isStaticMatch = inputUsername === configuredUsername && inputPassword === configuredPassword;

    if (!isStaticMatch) {
      return sendError(
        res,
        'अमान्य यूज़र आईडी या पासवर्ड (Invalid User ID or Password)',
        ['Invalid credentials'],
        401
      );
    }

    // Ensure Admin profile exists in MongoDB
    let adminUser = await User.findOne({
      $or: [
        { username: configuredUsername },
        { role: 'admin' },
      ],
    });

    if (!adminUser) {
      adminUser = await User.create({
        username: configuredUsername,
        name: 'श्री व्यवस्थापक (Admin)',
        mobile: '+919644492671',
        role: 'admin',
        status: 'active',
        permissions: ['ALL_PERMISSIONS', 'SUPER_ADMIN'],
        isActive: true,
      });
    } else {
      let needsSave = false;
      if (!adminUser.username) {
        adminUser.username = configuredUsername;
        needsSave = true;
      }
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        needsSave = true;
      }
      if (adminUser.status !== 'active') {
        adminUser.status = 'active';
        needsSave = true;
      }
      adminUser.lastLoginAt = new Date();
      await adminUser.save();
    }

    // Sign JWT token valid for 30 days
    const jwtSecret = process.env.JWT_SECRET || 'jadam_kuldevi_mandir_super_secure_jwt_secret_2026';
    const token = jwt.sign(
      {
        id: adminUser._id.toString(),
        username: adminUser.username || configuredUsername,
        role: adminUser.role,
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    return sendSuccess(res, 'प्रशासक लॉगिन सफल रहा (Admin login successful)', {
      token,
      user: adminUser.toSafeObject(),
    });
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    return sendError(res, 'लॉगिन प्रक्रिया में त्रुटि (Login failed)', [error.message], 500);
  }
};

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/v1/auth/me
 * @access  Private (Authenticated User)
 */
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', [], 401);
    }

    return sendSuccess(res, 'User profile retrieved successfully', {
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    return sendError(res, 'Failed to retrieve user profile', [error.message], 500);
  }
};

/**
 * @desc    Synchronize authenticated user session with MongoDB
 * @route   POST /api/v1/auth/sync
 * @access  Private (Authenticated User)
 */
const syncUser = async (req, res) => {
  try {
    const user = req.user;

    // Optional safe update of devotee name if supplied
    if (req.body && typeof req.body.name === 'string' && req.body.name.trim()) {
      const sanitizedName = req.body.name.trim().substring(0, 100);
      if (sanitizedName && user.name !== sanitizedName) {
        user.name = sanitizedName;
        await user.save();
      }
    }

    return sendSuccess(res, 'User session synchronized successfully', {
      user: user.toSafeObject(),
    });
  } catch (error) {
    return sendError(res, 'Failed to synchronize user session', [error.message], 500);
  }
};

module.exports = {
  loginAdmin,
  getCurrentUser,
  syncUser,
};
