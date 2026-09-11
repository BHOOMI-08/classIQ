import { QuizResult } from '../models/quizResult.model.js';
import { QuizNotification } from '../models/quizNotification.model.js';
import { ApiError } from '../../../utils/api-error.js';
import { RESULT_STATUS } from '../utils/quiz.constants.js';
import { getIO } from '../../../socket/socket.server.js';
import { logger } from '../../../utils/logger.js';

export class ResultReleaseService {
  static async releaseResults(quizId, releasedBy) {
    const results = await QuizResult.find({ quizId, status: { $in: [RESULT_STATUS.AUTO_GRADED, RESULT_STATUS.FINALIZED] } });
    if (results.length === 0) {
      throw ApiError.conflict('No finalized results ready for release');
    }

    const now = new Date();
    for (const result of results) {
      result.status = RESULT_STATUS.RELEASED;
      result.releasedAt = now;
      result.releasedBy = releasedBy;
      await result.save();

      // Notify student
      await QuizNotification.create({
        quizId,
        classroomId: result.classroomId,
        recipientId: result.studentId,
        recipientRole: 'student',
        type: 'result_released',
        message: `Your quiz result is now available. Score: ${result.finalMarks}/${result.totalMarks}`,
      });

      // Emit Socket.IO
      try {
        const io = getIO();
        io.to(`student:${result.studentId}`).emit('quiz:result_released', {
          quizId,
          resultId: result._id,
          finalMarks: result.finalMarks,
          totalMarks: result.totalMarks,
          gradeLabel: result.gradeLabel,
        });
      } catch (_) {}
    }

    logger.info(`📢 Released ${results.length} quiz results for quiz ${quizId}`);
    return { releasedCount: results.length };
  }

  static async getStudentResult(attemptId, studentId, quiz) {
    const result = await QuizResult.findOne({ attemptId }).lean();
    if (!result) throw ApiError.notFound('Result not available yet');
    if (result.studentId.toString() !== studentId.toString()) throw ApiError.forbidden('Not your result');

    if (result.status !== RESULT_STATUS.RELEASED) {
      return { available: false, status: result.status, message: 'Result has not been released yet' };
    }

    return { available: true, result };
  }
}
