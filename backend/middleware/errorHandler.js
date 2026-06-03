/**
 * Central error handling middleware
 */
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error for server-side debugging
  console.error(err.stack);
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Custom error class with status code
 */
exports.AppError = class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
};

/**
 * Async handler to catch errors in async route handlers
 */
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};