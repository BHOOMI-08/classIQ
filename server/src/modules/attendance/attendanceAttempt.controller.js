import { AttendanceAttemptService } from './attendanceAttempt.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class AttendanceAttemptController {
  static getSessionAttempts = async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const data = await AttendanceAttemptService.getSessionAttempts(sessionId, req.query);
      return ApiResponse.success(res, 200, 'Session attempts retrieved', data);
    } catch (err) {
      next(err);
    }
  };
}
