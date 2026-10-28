const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  registerPublicYatra,
  checkPublicRegistrationStatus,
} = require('../controllers/publicYatraController');

// Rate limiter for public registrations (25 registrations per 15 mins per IP)
const publicRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'पंजीकरण अनुरोध सीमा पार हो गई है। कृपया 15 मिनट बाद पुनः प्रयास करें।',
    errors: ['Rate limit exceeded for public yatra registration'],
  },
});

// Rate limiter for status lookup (60 checks per 15 mins per IP)
const publicCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'स्थिति जांच अनुरोध सीमा पार हो गई है। कृपया कुछ देर बाद प्रयास करें।',
    errors: ['Rate limit exceeded for registration check'],
  },
});

// Public endpoints
router.post('/register', publicRegisterLimiter, registerPublicYatra);
router.get('/check', publicCheckLimiter, checkPublicRegistrationStatus);

module.exports = router;
