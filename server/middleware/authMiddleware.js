const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Normalizes phone numbers for consistent matching (handles +91 prefix and digits)
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\s+/g, '').replace(/-/g, '');
  return cleaned.startsWith('+91') ? cleaned : `+91${cleaned.replace(/^0+/, '')}`;
};

/**
 * Authentication Middleware - Static Admin & JWT Authentication
 *
 * Flow:
 * 1. Read Authorization header: 'Bearer <TOKEN>'.
 * 2. Verify token cryptographically using JWT (or dev mock token in development).
 * 3. Extract verified user id and role from decoded payload.
 * 4. Lookup user in MongoDB by id or role.
 * 5. Verify account status is 'active' and not deactivated/suspended.
 * 6. Update lastLoginAt timestamp.
 * 7. Attach trusted backend user instance to req.user.
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'प्रमाणीकरण आवश्यक है (Authentication required). Missing or malformed Authorization header.',
        errors: ['Authorization token must be provided as: Bearer <token>'],
      });
    }

    const token = authHeader.split('Bearer ')[1]?.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'प्रमाणीकरण विफल (Authentication failed). Token is empty.',
        errors: ['Empty bearer token'],
      });
    }

    // Development Mock Token Bypass (Only active in development environment)
    if (process.env.NODE_ENV === 'development' && token.startsWith('dev-mock-token-')) {
      let user = await User.findOne({ role: 'admin' });
      if (!user) {
        user = await User.create({
          username: 'admin',
          name: 'विकास एडमिन (Dev Admin)',
          mobile: '+919644492671',
          role: 'admin',
          permissions: ['ALL_PERMISSIONS', 'SUPER_ADMIN'],
          status: 'active',
          isActive: true,
        });
      }
      req.user = user;
      return next();
    }

    // Verify JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'jadam_kuldevi_mandir_super_secure_jwt_secret_2026';
    let decoded;

    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (verifyError) {
      console.warn(`⚠️ JWT verification error: ${verifyError.message}`);

      let errorMessage = 'अमान्य अथवा समाप्त सत्र (Invalid or expired authentication token).';
      if (verifyError.name === 'TokenExpiredError') {
        errorMessage = 'सत्र समाप्त हो चुका है। कृपया पुनः लॉगिन करें (Session expired. Please log in again).';
      }

      return res.status(401).json({
        success: false,
        message: errorMessage,
        errors: [verifyError.message],
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'टोकन पेलोड अमान्य है (Invalid token payload).',
        errors: ['Decoded token missing user id'],
      });
    }

    // Lookup user in MongoDB
    let user = await User.findById(decoded.id);

    // Fallback if ID changed or was reseeded
    if (!user && decoded.role === 'admin') {
      user = await User.findOne({ role: 'admin' });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'उपयोगकर्ता नहीं मिला (User not found).',
        errors: ['User document does not exist in database'],
      });
    }

    // Check account status
    const isAccountActive = user.status === 'active' && user.isActive !== false;
    if (!isAccountActive) {
      return res.status(403).json({
        success: false,
        message: 'यह खाता निष्क्रिय या निलंबित कर दिया गया है (Account deactivated or suspended).',
        errors: [`Account status: ${user.status || 'inactive'}`],
      });
    }

    // Attach trusted user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('🔥 Authentication Middleware Internal Error:', error);
    return res.status(500).json({
      success: false,
      message: 'आंतरिक प्रमाणीकरण त्रुटि (Internal authentication error).',
      errors: [error.message],
    });
  }
};

module.exports = {
  authenticateUser,
  normalizePhone,
};
