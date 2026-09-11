import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : error.message || 'Internal server error';
    error = new ApiError(statusCode, message, [], false);
  }

  if (error.statusCode >= 500) {
    logger.error('💥 Server Error:', { message: err.message, stack: err.stack });
  }

  return ApiResponse.error(
    res,
    error.statusCode,
    error.message,
    error.errors
  );
};
