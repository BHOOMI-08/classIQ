import { QuizAIService } from '../services/quizAI.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const generateQuizWithAI = async (req, res, next) => {
  try {
    const result = await QuizAIService.generateQuiz({
      classroomId: req.params.classId,
      teacherId: req.user._id,
      ...req.body,
    });
    ApiResponse.success(res, 200, 'AI quiz generated — review and save as a quiz', result);
  } catch (err) { next(err); }
};
