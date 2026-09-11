import { QuizAttempt } from '../models/quizAttempt.model.js';
import { QuizAnswer } from '../models/quizAnswer.model.js';
import { QuizAttemptEvent } from '../models/quizAttemptEvent.model.js';
import { QuizProcessingJob } from '../models/quizProcessingJob.model.js';
import { QuizNotification } from '../models/quizNotification.model.js';
import { generateReceiptCode } from '../utils/attemptToken.utils.js';
import { ApiError } from '../../../utils/api-error.js';
import { ACTIVE_ATTEMPT_STATUSES } from '../utils/quiz.constants.js';
import { getIO } from '../../../socket/socket.server.js';
import { logger } from '../../../utils/logger.js';

export class QuizSubmissionService {
  /**
   * Manual student submission.
   */
  static async submitAttempt(attemptId, studentId, { autoSubmit = false } = {}) {
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) throw ApiError.notFound('Attempt not found');
    if (attempt.studentId.toString() !== studentId.toString()) throw ApiError.forbidden('Not your attempt');

    // Idempotent — return existing receipt if already submitted
    if (['submitted', 'auto_submitted'].includes(attempt.status)) {
      return { receiptCode: attempt.submissionReceiptCode, alreadySubmitted: true };
    }

    if (!ACTIVE_ATTEMPT_STATUSES.includes(attempt.status)) {
      throw ApiError.conflict(`Cannot submit attempt with status: ${attempt.status}`);
    }

    const now = new Date();
    const receiptCode = attempt.submissionReceiptCode || generateReceiptCode();

    attempt.status = autoSubmit ? 'auto_submitted' : 'submitted';
    attempt.submittedAt = now;
    if (autoSubmit) attempt.autoSubmittedAt = now;
    attempt.submissionReceiptCode = receiptCode;
    await attempt.save();

    // Lock all answers
    await QuizAnswer.updateMany({ attemptId, status: 'saved' }, { $set: { status: 'submitted' } });

    // Record event
    await QuizAttemptEvent.create({
      attemptId,
      quizId: attempt.quizId,
      studentId,
      eventType: autoSubmit ? 'auto_submit' : 'manual_submit',
      metadata: { receiptCode },
      serverTimestamp: now,
    });

    // Queue grading job
    await QuizProcessingJob.create({
      quizId: attempt.quizId,
      attemptId: attempt._id,
      classroomId: attempt.classroomId,
      jobType: 'grade_attempt',
      status: 'pending',
      scheduledFor: now,
    });

    // Notify student
    try {
      await QuizNotification.create({
        quizId: attempt.quizId,
        classroomId: attempt.classroomId,
        recipientId: studentId,
        recipientRole: 'student',
        type: autoSubmit ? 'quiz_closing_soon' : 'result_released',
        message: autoSubmit ? 'Your quiz was auto-submitted at timeout.' : `Quiz submitted. Receipt: ${receiptCode}`,
      });
    } catch (_) {}

    // Emit Socket.IO events
    try {
      const io = getIO();
      const event = autoSubmit ? 'quiz:auto_submitted' : 'quiz:attempt_submitted';
      io.to(`attempt:${attemptId}`).emit(event, { attemptId, receiptCode, submittedAt: now });
      io.to(`quiz_monitor:${attempt.quizId}`).emit(event, { attemptId, studentId, submittedAt: now });
    } catch (_) {}

    logger.info(`✅ Quiz ${autoSubmit ? 'auto-' : ''}submitted: attempt ${attemptId}`);
    return { receiptCode, submittedAt: now };
  }
}
