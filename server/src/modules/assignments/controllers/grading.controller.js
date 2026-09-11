import { GradingService } from '../services/grading.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { rawMarks, rubricCriteriaMarks, adjustmentMarks, overallFeedback, internalNote, isPublished } = req.body;

    const result = await GradingService.gradeSubmission({
      submissionId,
      teacherId: req.user._id,
      rawMarks,
      rubricCriteriaMarks,
      adjustmentMarks,
      overallFeedback,
      internalNote,
      isPublished: isPublished === true,
    });

    return ApiResponse.created(res, 'Submission graded successfully', result);
  } catch (err) {
    next(err);
  }
};

export const returnSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const result = await GradingService.returnSubmission(submissionId, req.user._id);
    return ApiResponse.success(res, 'Assignment returned to student', result);
  } catch (err) {
    next(err);
  }
};
