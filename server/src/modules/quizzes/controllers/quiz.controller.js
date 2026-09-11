import { QuizService } from '../services/quiz.service.js';
import { QuizLifecycleService } from '../services/quizLifecycle.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const createQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizService.createDraft({ classroomId: req.params.classId, teacherId: req.user._id, data: req.body });
    ApiResponse.created(res, { quiz }, 'Quiz draft created');
  } catch (err) { next(err); }
};

export const getClassroomQuizzes = async (req, res, next) => {
  try {
    const studentView = req.user.role === 'student';
    const quizzes = await QuizService.getClassroomQuizzes(req.params.classId, { status: req.query.status, studentView });
    ApiResponse.success(res, 200, 'Quizzes fetched', { quizzes });
  } catch (err) { next(err); }
};

export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizService.getQuizById(req.params.quizId);
    ApiResponse.success(res, 200, 'Quiz fetched', { quiz });
  } catch (err) { next(err); }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizService.updateQuiz(req.params.quizId, req.user._id, req.body);
    ApiResponse.success(res, 200, 'Quiz updated', { quiz });
  } catch (err) { next(err); }
};

export const publishQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizLifecycleService.publishQuiz(req.params.quizId, req.body);
    ApiResponse.success(res, 200, 'Quiz published', { quiz });
  } catch (err) { next(err); }
};

export const duplicateQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizService.duplicateQuiz(req.params.quizId, req.user._id);
    ApiResponse.created(res, { quiz }, 'Quiz duplicated');
  } catch (err) { next(err); }
};

export const archiveQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizService.archiveQuiz(req.params.quizId);
    ApiResponse.success(res, 200, 'Quiz archived', { quiz });
  } catch (err) { next(err); }
};

export const cancelQuiz = async (req, res, next) => {
  try {
    const quiz = await QuizService.cancelQuiz(req.params.quizId, req.body.reason);
    ApiResponse.success(res, 200, 'Quiz cancelled', { quiz });
  } catch (err) { next(err); }
};
