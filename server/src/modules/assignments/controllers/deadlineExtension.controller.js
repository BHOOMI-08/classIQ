import { DeadlineExtensionService } from '../services/deadlineExtension.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const grantExtension = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, extendedDueAt, reason } = req.body;

    const extension = await DeadlineExtensionService.grantExtension({
      assignmentId,
      classroomId: req.assignment.classroomId,
      studentId: studentId || null,
      teacherId: req.user._id,
      extendedDueAt,
      reason,
    });

    return ApiResponse.created(res, 'Deadline extension granted', { extension });
  } catch (err) {
    next(err);
  }
};

export const getExtensions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const extensions = await DeadlineExtensionService.getAssignmentExtensions(assignmentId);
    return ApiResponse.success(res, 'Deadline extensions retrieved', { items: extensions });
  } catch (err) {
    next(err);
  }
};
