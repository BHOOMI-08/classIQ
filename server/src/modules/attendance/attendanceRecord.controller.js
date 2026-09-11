import { AttendanceRecordService } from './attendanceRecord.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class AttendanceRecordController {
  static getSessionRecords = async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const data = await AttendanceRecordService.getSessionRecords(sessionId, req.query);
      return ApiResponse.success(res, 200, 'Session records retrieved', data);
    } catch (err) {
      next(err);
    }
  };

  static getStudentRecords = async (req, res, next) => {
    try {
      const studentId = req.user._id;
      const data = await AttendanceRecordService.getStudentRecords(studentId, req.query);
      return ApiResponse.success(res, 200, 'Student records retrieved', data);
    } catch (err) {
      next(err);
    }
  };
}
