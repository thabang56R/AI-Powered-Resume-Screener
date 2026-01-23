// src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
};