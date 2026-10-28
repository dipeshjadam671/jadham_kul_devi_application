/**
 * 404 Route Not Found Middleware
 * Intercepts requests to undefined routes and returns standardized JSON response
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: [
      {
        path: req.originalUrl,
        method: req.method,
        detail: 'The requested API endpoint does not exist on this server.',
      },
    ],
  });
};

module.exports = notFoundHandler;
