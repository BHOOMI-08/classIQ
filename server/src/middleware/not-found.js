import { ApiError } from '../utils/api-error.js';

export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found - ${req.originalUrl}`));
};
