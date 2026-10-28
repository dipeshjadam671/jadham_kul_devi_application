/**
 * Standardized API Response Utilities
 * Enforces uniform response shapes across the entire backend.
 */

/**
 * Send a standardized success JSON response
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Human-readable success message
 * @param {object|array|null} data - Payload data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message = 'Operation successful', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardized error JSON response
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Error description
 * @param {array|object|null} errors - Array or object of detailed errors
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const sendError = (res, message = 'Something went wrong', errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
