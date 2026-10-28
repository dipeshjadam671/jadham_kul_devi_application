const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const healthRoutes = require('./routes/health.routes');
const apiV1Routes = require('./routes/api/v1');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman) in dev
      if (!origin || origin === allowedOrigin || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation: Access not allowed from this origin.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

const path = require('path');

// 4. Request Body Parsing & Static Files
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 5. Rate Limiting (100 requests per 15 minutes per IP on API routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    errors: ['Rate limit exceeded'],
  },
});
app.use('/api', apiLimiter);

// 6. API Route Mounting
// Root health check: GET /api/health
app.use('/api', healthRoutes);

// Versioned API routes: /api/v1
app.use('/api/v1', apiV1Routes);

// 7. Root status handler
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'जादम परिवार कुलदेवी मंदिर API Server is active. Health check: /api/health',
  });
});

// 8. 404 Route Not Found Handler
app.use(notFoundHandler);

// 9. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
