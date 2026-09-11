import { ClassroomActivity } from '../models/classroomActivity.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class ClassroomTimelineService {
  /**
   * Fetch paginated classroom activity timeline events with role-based visibility rules.
   */
  static async getTimeline(userId, userRole, classId, { moduleFilter, page = 1, limit = 20 }) {
    // Verify Access
    if (userRole === 'student') {
      const isEnrolled = await Enrollment.findOne({ classroomId: classId, studentId: userId, status: 'active' });
      if (!isEnrolled) throw ApiError.forbidden('Enrolled students only');
    } else if (userRole === 'teacher') {
      const classroom = await Classroom.findById(classId).lean();
      if (!classroom || classroom.teacherId.toString() !== userId.toString()) {
        throw ApiError.forbidden('Classroom owner only');
      }
    }

    const query = { classroomId: classId };

    // Apply Visibility Restrictions
    if (userRole === 'student') {
      query.visibility = { $in: ['students', 'all_members'] };
    }

    if (moduleFilter && moduleFilter !== 'all') {
      query.sourceModule = moduleFilter;
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      ClassroomActivity.find(query).sort({ occurredAt: -1 }).skip(skip).limit(limit).lean(),
      ClassroomActivity.countDocuments(query),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
