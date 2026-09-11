import { ResultReleaseService } from '../services/resultRelease.service.js';
import { QuizResult } from '../models/quizResult.model.js';
import { QuestionScore } from '../models/questionScore.model.js';
import { TopicPerformance } from '../models/topicPerformance.model.js';
import { AIExplanationService } from '../services/aiExplanation.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const getStudentResult = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const result = await ResultReleaseService.getStudentResult(attemptId, req.user._id);
    if (!result.available) return ApiResponse.success(res, 200, result.message, result);

    // Fetch topic performance and question scores based on review policy
    const topicPerformance = await TopicPerformance.find({ attemptId }).lean();
    let questionScores = [];
    const quiz = req.quiz; // injected by middleware if needed

    ApiResponse.success(res, 200, 'Result available', { ...result, topicPerformance, questionScores });
  } catch (err) { next(err); }
};

export const getTeacherAttemptResult = async (req, res, next) => {
  try {
    const result = await QuizResult.findOne({ attemptId: req.params.attemptId })
      .populate('studentId', 'name email')
      .lean();
    if (!result) return ApiResponse.success(res, 200, 'Not graded yet', null);

    const scores = await QuestionScore.find({ resultId: result._id }).lean();
    const topicPerformance = await TopicPerformance.find({ attemptId: req.params.attemptId }).lean();
    ApiResponse.success(res, 200, 'Result fetched', { result, scores, topicPerformance });
  } catch (err) { next(err); }
};

export const releaseResults = async (req, res, next) => {
  try {
    const data = await ResultReleaseService.releaseResults(req.params.quizId, req.user._id);
    ApiResponse.success(res, 200, `${data.releasedCount} results released`, data);
  } catch (err) { next(err); }
};

export const getQuizResultsList = async (req, res, next) => {
  try {
    const results = await QuizResult.find({ quizId: req.params.quizId })
      .populate('studentId', 'name email')
      .populate('attemptId', 'attemptNumber submittedAt status')
      .sort({ createdAt: -1 })
      .lean();
    ApiResponse.success(res, 200, 'Results fetched', { results });
  } catch (err) { next(err); }
};

export const getExplanation = async (req, res, next) => {
  try {
    const { scoreId } = req.params;
    const score = await QuestionScore.findById(scoreId).populate('attemptQuestionId').lean();
    if (!score) return next(new Error('Score not found'));

    const aq = score.attemptQuestionId;
    const explanation = await AIExplanationService.generateExplanation({
      question: aq?.promptSnapshot || '',
      studentAnswer: score.matchedAnswer || score.selectedOptionIds,
      correctAnswer: aq?.answerKeySnapshot,
      topic: score.topic,
      teacherExplanation: aq?.explanationSnapshot || '',
      sourceChunkIds: aq?.sourceChunkIds || [],
    });

    ApiResponse.success(res, 200, 'AI explanation generated', { explanation });
  } catch (err) { next(err); }
};
