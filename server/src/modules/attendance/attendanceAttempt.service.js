import { AttendanceAttempt } from './attendanceAttempt.model.js';

export class AttendanceAttemptService {
  /**
   * Get attendance attempts for a session with filters.
   */
  static async getSessionAttempts(sessionId, query = {}) {
    const { suspicionLevel, result, page = 1, limit = 50 } = query;

    const filter = { sessionId };
    if (suspicionLevel && suspicionLevel !== 'all') {
      filter.suspicionLevel = suspicionLevel;
    }
    if (result && result !== 'all') {
      filter.result = result;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      AttendanceAttempt.find(filter)
        .populate('studentId', 'name email rollNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AttendanceAttempt.countDocuments(filter),
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
