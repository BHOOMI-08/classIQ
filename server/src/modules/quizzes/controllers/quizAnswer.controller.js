import { AnswerAutosaveService } from '../services/answerAutosave.service.js';
import { QuizAnswer } from '../models/quizAnswer.model.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const saveAnswer = async (req, res, next) => {
  try {
    const { attemptQuestionId } = req.params;
    const answerPayload = req.body.answerPayload || req.body;
    const { isFlagged, clientSequence, timeSpentSeconds } = req.body;
    const result = await AnswerAutosaveService.saveAnswer({
      attemptId: req.params.attemptId,
      attemptQuestionId,
      studentId: req.user._id,
      answerPayload,
      isFlagged,
      clientSequence,
      timeSpentSeconds,
    });
    ApiResponse.success(res, 200, result.stale ? 'Stale save ignored' : 'Answer saved', result);
  } catch (err) { next(err); }
};

export const getAnswers = async (req, res, next) => {
  try {
    const answers = await QuizAnswer.find({ attemptId: req.params.attemptId }).lean();
    ApiResponse.success(res, 200, 'Answers fetched', { answers });
  } catch (err) { next(err); }
};
