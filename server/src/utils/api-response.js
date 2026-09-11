export class ApiResponse {
  /**
   * Universal success response handler supporting multiple argument signatures:
   * 1. ApiResponse.success(res, statusCode, message, data)
   * 2. ApiResponse.success(res, data, message)
   * 3. ApiResponse.success(res, message)
   */
  static success(res, arg2 = 200, arg3 = '', arg4 = null) {
    let statusCode = 200;
    let message = '';
    let data = null;

    if (typeof arg2 === 'number') {
      statusCode = arg2;
      message = typeof arg3 === 'string' ? arg3 : '';
      data = arg4 !== null ? arg4 : (typeof arg3 === 'object' ? arg3 : null);
    } else if (typeof arg2 === 'string') {
      message = arg2;
      data = arg3;
    } else {
      // arg2 is data object
      data = arg2;
      message = typeof arg3 === 'string' ? arg3 : 'Success';
      if (typeof arg4 === 'number') statusCode = arg4;
    }

    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Helper for 201 Created responses
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, 201, message, data);
  }

  /**
   * Universal error response handler
   */
  static error(res, statusCode = 500, message = 'An error occurred', errors = []) {
    const code = typeof statusCode === 'number' ? statusCode : 500;
    const msg = typeof message === 'string' ? message : 'An error occurred';
    const errList = Array.isArray(errors) && errors.length > 0 ? errors : undefined;

    return res.status(code).json({
      success: false,
      message: msg,
      errors: errList,
    });
  }
}
