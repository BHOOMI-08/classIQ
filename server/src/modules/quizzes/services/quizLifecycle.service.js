import { Quiz } from '../models/quiz.model.js';
import { QuizQuestionMap } from '../models/quizQuestionMap.model.js';
import { QuizNotification } from '../models/quizNotification.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { ApiError } from '../../../utils/api-error.js';
import { QUIZ_STATUS } from '../utils/quiz.constants.js';
import { getIO } from '../../../socket/socket.server.js';
import { logger } from '../../../utils/logger.js';

export class QuizLifecycleService {
  /**
   * Validate and publish (or schedule) a quiz.
   */
  static async publishQuiz(quizId, { schedule = false, scheduledPublishAt = null, openingAt, closingAt } = {}) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw ApiError.notFound('Quiz not found');

    if ([QUIZ_STATUS.ARCHIVED, QUIZ_STATUS.CANCELLED].includes(quiz.status)) {
      throw ApiError.conflict('Cannot publish an archived or cancelled quiz');
    }

    if (quiz.status !== QUIZ_STATUS.DRAFT && quiz.status !== QUIZ_STATUS.SCHEDULED) {
      throw ApiError.conflict(`Quiz is already ${quiz.status}`);
    }

    // Validate question count and marks
    const questionMaps = await QuizQuestionMap.find({ quizId }).lean();
    if (questionMaps.length === 0) {
      throw ApiError.badRequest('Quiz must have at least one question before publishing');
    }

    const mapTotalMarks = questionMaps.reduce((sum, m) => sum + m.marks, 0);
    if (Math.abs(mapTotalMarks - quiz.totalMarks) > 0.01) {
      throw ApiError.badRequest(`Question marks total (${mapTotalMarks}) does not match quiz total marks (${quiz.totalMarks})`);
    }

    if (openingAt) quiz.openingAt = new Date(openingAt);
    if (closingAt) quiz.closingAt = new Date(closingAt);
    if (quiz.openingAt && quiz.closingAt && quiz.closingAt <= quiz.openingAt) {
      throw ApiError.badRequest('closingAt must be after openingAt');
    }

    const now = new Date();
    if (schedule && scheduledPublishAt) {
      quiz.status = QUIZ_STATUS.SCHEDULED;
      quiz.scheduledPublishAt = new Date(scheduledPublishAt);
    } else {
      quiz.status = QUIZ_STATUS.PUBLISHED;
      quiz.publishedAt = now;

      // Notify enrolled students
      await QuizLifecycleService._notifyStudents(quiz, 'quiz_published', `New quiz published: ${quiz.title}`);

      try {
        const io = getIO();
        io.to(`classroom:${quiz.classroomId}`).emit('quiz:published', { quizId: quiz._id, title: quiz.title });
      } catch (_) {}
    }

    quiz.totalQuestions = questionMaps.length;
    await quiz.save();
    return quiz;
  }

  static async _notifyStudents(quiz, type, message) {
    try {
      const enrollments = await Enrollment.find({ classroomId: quiz.classroomId, status: 'active' }).lean();
      const notifications = enrollments.map((e) => ({
        quizId: quiz._id,
        classroomId: quiz.classroomId,
        recipientId: e.studentId,
        recipientRole: 'student',
        type,
        message,
      }));
      if (notifications.length > 0) await QuizNotification.insertMany(notifications);
    } catch (err) {
      logger.warn('Failed to create quiz notifications:', err.message);
    }
  }

  /**
   * Activate a published quiz when openingAt is reached.
   */
  static async activateQuiz(quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== QUIZ_STATUS.PUBLISHED) return;
    quiz.status = QUIZ_STATUS.ACTIVE;
    await quiz.save();
    logger.info(`✅ Quiz activated: ${quiz.title}`);
  }

  /**
   * Close quiz when closingAt is reached.
   */
  static async closeQuiz(quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || ![QUIZ_STATUS.PUBLISHED, QUIZ_STATUS.ACTIVE].includes(quiz.status)) return;
    quiz.status = QUIZ_STATUS.CLOSED;
    await quiz.save();
    logger.info(`🔒 Quiz closed: ${quiz.title}`);
    try {
      const io = getIO();
      io.to(`quiz:${quizId}`).emit('quiz:closed', { quizId });
    } catch (_) {}
  }
}
