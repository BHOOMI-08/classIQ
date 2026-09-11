import { AttendanceAnalyticsService } from './attendanceAnalytics.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class AttendanceAnalyticsController {
  static getMyHealth = async (req, res, next) => {
    try {
      const data = await AttendanceAnalyticsService.getStudentOverallHealth(req.user._id);
      return ApiResponse.success(res, 200, 'Student attendance health retrieved', data);
    } catch (err) {
      next(err);
    }
  };

  static getClassHealth = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const data = await AttendanceAnalyticsService.getStudentClassHealth(req.user._id, classroomId);
      return ApiResponse.success(res, 200, 'Class attendance health retrieved', data);
    } catch (err) {
      next(err);
    }
  };

  static getForecast = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const data = await AttendanceAnalyticsService.getAttendanceForecast(req.user._id, classroomId);
      return ApiResponse.success(res, 200, 'Attendance forecast retrieved', data);
    } catch (err) {
      next(err);
    }
  };

  static recalculateSessionStats = async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const stats = await AttendanceAnalyticsService.recalculateSessionStats(sessionId);
      return ApiResponse.success(res, 200, 'Session stats recalculated', { stats });
    } catch (err) {
      next(err);
    }
  };
}
