const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Try to parse JSON error messages from validation
  try {
    if (typeof message === 'string' && message.startsWith('{')) {
      message = JSON.parse(message);
    }
  } catch (e) {
    // Keep original message if parsing fails
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
