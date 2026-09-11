import { QuizAnalyticsService } from '../services/quizAnalytics.service.js';
import { QuizAnalyticsSnapshot } from '../models/quizAnalyticsSnapshot.model.js';
import { QuestionAnalyticsSnapshot } from '../models/questionAnalyticsSnapshot.model.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const getQuizAnalytics = async (req, res, next) => {
  try {
    const quizId = req.params.quizId;
    const quiz = req.quiz;

    // Serve cached snapshot or compute fresh
    let snapshot = await QuizAnalyticsSnapshot.findOne({ quizId }).lean();
    if (!snapshot) {
      snapshot = await QuizAnalyticsService.computeQuizAnalytics(quizId, quiz.classroomId);
    }

    ApiResponse.success(res, 200, 'Quiz analytics fetched', { analytics: snapshot });
  } catch (err) { next(err); }
};

export const getQuestionAnalytics = async (req, res, next) => {
  try {
    const quizId = req.params.quizId;
    let snapshots = await QuestionAnalyticsSnapshot.find({ quizId }).lean();
    if (snapshots.length === 0) {
      snapshots = await QuizAnalyticsService.computeQuestionAnalytics(quizId);
    }
    ApiResponse.success(res, 200, 'Question analytics fetched', { analytics: snapshots });
  } catch (err) { next(err); }
};
