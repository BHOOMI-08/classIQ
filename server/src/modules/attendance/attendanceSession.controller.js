import { AttendanceSessionService } from './attendanceSession.service.js';
import { AttendanceSubmissionService } from './attendanceSubmission.service.js';
import { AttendanceSession } from './attendanceSession.model.js';
import { ApiResponse } from '../../utils/api-response.js';

export class AttendanceSessionController {
  static startSession = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const { session, qrToken } = await AttendanceSessionService.startSession(
        req.user,
        classroomId,
        req.body,
        req.ip,
        req.headers['user-agent']
      );
      return ApiResponse.success(res, 201, 'Attendance session started successfully', { session, qrToken });
    } catch (err) {
      next(err);
    }
  };

  static getCurrentToken = async (req, res, next) => {
    try {
      const session = req.attendanceSession || (await AttendanceSession.findById(req.params.sessionId));
      const tokenData = await AttendanceSessionService.getCurrentQrToken(session);
      return ApiResponse.success(res, 200, 'Current QR token generated', tokenData);
    } catch (err) {
      next(err);
    }
  };

  static submitAttendance = async (req, res, next) => {
    try {
      const { token, location, device, challengeResponse } = req.body;
      const result = await AttendanceSubmissionService.submitAttendance({
        studentUser: req.user,
        tokenString: token,
        location,
        devicePayload: device || {},
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return ApiResponse.success(res, 200, 'Attendance recorded successfully', result);
    } catch (err) {
      next(err);
    }
  };

  static endSession = async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body || {};
      const session = await AttendanceSessionService.endSession(
        sessionId,
        req.user,
        reason,
        req.ip,
        req.headers['user-agent']
      );
      return ApiResponse.success(res, 200, 'Attendance session ended successfully', { session });
    } catch (err) {
      next(err);
    }
  };

  static cancelSession = async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body || {};
      const session = await AttendanceSessionService.cancelSession(
        sessionId,
        req.user,
        reason,
        req.ip,
        req.headers['user-agent']
      );
      return ApiResponse.success(res, 200, 'Attendance session cancelled successfully', { session });
    } catch (err) {
      next(err);
    }
  };

  static getActiveSession = async (req, res, next) => {
    try {
      const classroomId = req.params.classroomId || req.params.classId;
      const session = await AttendanceSession.findOne({ classroomId, status: 'active' });
      return ApiResponse.success(res, 200, session ? 'Active session found' : 'No active session', { session });
    } catch (err) {
      next(err);
    }
  };
}
