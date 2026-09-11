import { ApiError } from '../utils/api-error.js';
import { AttendanceSession } from '../modules/attendance/attendanceSession.model.js';
import { Classroom } from '../modules/classrooms/classroom.model.js';
import { Enrollment } from '../modules/enrollments/enrollment.model.js';

/**
 * Middleware ensuring current user is teacher owner or admin of the session's classroom.
 * Expects req.params.sessionId or req.params.id
 */
export const requireAttendanceSessionOwner = async (req, _res, next) => {
  try {
    const sessionId = req.params.sessionId || req.params.id;
    if (!sessionId) {
      throw ApiError.badRequest('Session ID parameter required');
    }

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      throw ApiError.notFound('Attendance session not found');
    }

    if (req.user.role === 'admin') {
      req.attendanceSession = session;
      return next();
    }

    const classroom = await Classroom.findById(session.classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    if (req.user.role !== 'teacher' || classroom.teacherId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not authorized to manage attendance for this classroom');
    }

    req.attendanceSession = session;
    req.classroom = classroom;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware ensuring user is either session owner teacher/admin OR an enrolled student in the classroom.
 */
export const requireAttendanceSessionMember = async (req, _res, next) => {
  try {
    const sessionId = req.params.sessionId || req.params.id;
    if (!sessionId) {
      throw ApiError.badRequest('Session ID parameter required');
    }

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      throw ApiError.notFound('Attendance session not found');
    }

    if (req.user.role === 'admin' || session.teacherId.toString() === req.user._id.toString()) {
      req.attendanceSession = session;
      return next();
    }

    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        classroomId: session.classroomId,
        studentId: req.user._id,
        status: 'active',
      });

      if (!enrollment) {
        throw ApiError.forbidden('You are not enrolled in this classroom');
      }

      req.attendanceSession = session;
      req.enrollment = enrollment;
      return next();
    }

    throw ApiError.forbidden('Access denied');
  } catch (error) {
    next(error);
  }
};
