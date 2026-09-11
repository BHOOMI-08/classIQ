import { RubricService } from '../services/rubric.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const createRubric = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { title, totalMarks, criteria } = req.body;

    const result = await RubricService.createRubric({
      assignmentId,
      classroomId: req.assignment.classroomId,
      teacherId: req.user._id,
      title,
      totalMarks,
      criteria,
    });

    return ApiResponse.created(res, 'Rubric created successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getAssignmentRubric = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const rubric = await RubricService.getAssignmentRubric(assignmentId);
    return ApiResponse.success(res, 'Assignment rubric retrieved', { rubric });
  } catch (err) {
    next(err);
  }
};
