/**
 * Centralized Error Handling Middleware
 * Catches all thrown or forwarded errors in the Express pipeline
 * Formats errors to the standard JSON response without leaking sensitive stack traces in production
 */
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value entered for ${field}. Must be unique.`;
    errors = [{ field, message }];
  }

  // Mongoose Bad ObjectId Cast Error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
    errors = [{ field: err.path, message: 'Invalid ID format' }];
  }

  // Rate Limiting Error
  if (err.status === 429) {
    statusCode = 429;
    message = err.message || 'Too many requests, please try again later.';
  }

  // Log error internally in non-production environments
  if (!isProduction) {
    console.error('🔥 [Centralized Error Handler]:', {
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : [message],
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
