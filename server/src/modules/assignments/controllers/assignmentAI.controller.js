import { AssignmentAIService } from '../services/assignmentAI.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const generateAIAssignment = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { resourceIds, topic, unit, difficulty, totalMarks, assignmentType } = req.body;

    const generated = await AssignmentAIService.generateAssignment({
      classroomId: classId,
      resourceIds,
      topic,
      unit,
      difficulty,
      totalMarks,
      assignmentType,
    });

    return ApiResponse.created(res, 'AI assignment generated successfully', { assignment: generated });
  } catch (err) {
    next(err);
  }
};
