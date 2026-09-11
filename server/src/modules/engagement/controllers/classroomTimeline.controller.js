import { ClassroomTimelineService } from '../services/classroomTimeline.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export async function getClassroomTimeline(req, res, next) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { classId } = req.params;
    const { module: moduleFilter, page, limit } = req.query;

    const result = await ClassroomTimelineService.getTimeline(userId, userRole, classId, {
      moduleFilter,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });

    return ApiResponse.success(res, 200, 'Classroom timeline fetched', result);
  } catch (error) {
    next(error);
  }
}
