export class ApiError extends Error {
  constructor(arg1, arg2, errors = [], isOperational = true) {
    let statusCode = 400;
    let message = 'An error occurred';

    if (typeof arg1 === 'number') {
      statusCode = arg1;
      message = typeof arg2 === 'string' ? arg2 : 'An error occurred';
    } else if (typeof arg1 === 'string') {
      message = arg1;
      statusCode = typeof arg2 === 'number' ? arg2 : 400;
    } else if (typeof arg2 === 'number') {
      statusCode = arg2;
    }

    super(message);
    this.statusCode = statusCode;
    this.status = statusCode; // Backward compatibility alias
    this.message = message;
    this.errors = Array.isArray(errors) ? errors : [];
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden action') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], false);
  }
}
