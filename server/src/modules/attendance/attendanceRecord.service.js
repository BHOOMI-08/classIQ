import { AttendanceRecord } from './attendanceRecord.model.js';
import { AttendanceSession } from './attendanceSession.model.js';
import { ApiError } from '../../utils/api-error.js';

export class AttendanceRecordService {
  /**
   * Get attendance records for a session with pagination.
   */
  static async getSessionRecords(sessionId, query = {}) {
    const { status, search, page = 1, limit = 50 } = query;

    const filter = { sessionId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      AttendanceRecord.find(filter)
        .populate('studentId', 'name email avatarUrl')
        .sort({ markedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AttendanceRecord.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
    };
  }

  /**
   * Get student's attendance records across sessions/classrooms.
   */
  static async getStudentRecords(studentId, query = {}) {
    const { classroomId, page = 1, limit = 20 } = query;

    const filter = { studentId };
    if (classroomId) {
      filter.classroomId = classroomId;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      AttendanceRecord.find(filter)
        .populate('classroomId', 'name subjectName courseCode')
        .populate('sessionId', 'title startedAt endedAt status')
        .sort({ markedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AttendanceRecord.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
    };
  }
}
