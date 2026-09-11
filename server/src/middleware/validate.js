import { ZodError } from 'zod';
import { ApiError } from '../utils/api-error.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(ApiError.badRequest('Validation error', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
