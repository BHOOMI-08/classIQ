import { AttendanceAnalyticsService } from './attendanceAnalytics.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export class AttendanceAnalyticsController {
  static getClassroomOverview = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const data = await AttendanceAnalyticsService.getClassroomOverview(classroomId, req.query);
      return ApiResponse.success(res, 200, 'Classroom analytics overview fetched', data);
    } catch (err) {
      next(err);
    }
  };

  static getClassroomTrends = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const data = await AttendanceAnalyticsService.getClassroomTrends(classroomId, req.query);
      return ApiResponse.success(res, 200, 'Classroom trends fetched', data);
    } catch (err) {
      next(err);
    }
  };

  static getSessionAnalyticsList = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const data = await AttendanceAnalyticsService.getSessionAnalyticsList(classroomId, req.query);
      return ApiResponse.success(res, 200, 'Session analytics list fetched', data);
    } catch (err) {
      next(err);
    }
  };

  static getStudentInsight = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const { studentId } = req.params;
      const data = await AttendanceAnalyticsService.getStudentInsight(classroomId, studentId);
      return ApiResponse.success(res, 200, 'Student insight fetched', data);
    } catch (err) {
      next(err);
    }
  };

  static getSecurityAnalytics = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const data = await AttendanceAnalyticsService.getSecurityAnalytics(classroomId, req.query);
      return ApiResponse.success(res, 200, 'Security analytics fetched', data);
    } catch (err) {
      next(err);
    }
  };

  static getStudentHealth = async (req, res, next) => {
    try {
      const data = await AttendanceAnalyticsService.getStudentOverallHealth(req.user._id);
      return ApiResponse.success(res, 200, 'Student health fetched', data);
    } catch (err) {
      next(err);
    }
  };

  static getStudentClassHealth = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const data = await AttendanceAnalyticsService.getStudentClassHealth(req.user._id, classroomId);
      return ApiResponse.success(res, 200, 'Student class health fetched', data);
    } catch (err) {
      next(err);
    }
  };
}
