import { QuizAnswer } from '../models/quizAnswer.model.js';
import { QuizAttempt } from '../models/quizAttempt.model.js';
import { QuizAttemptQuestion } from '../models/quizAttemptQuestion.model.js';
import { QuizAttemptEvent } from '../models/quizAttemptEvent.model.js';
import { ApiError } from '../../../utils/api-error.js';
import { ACTIVE_ATTEMPT_STATUSES } from '../utils/quiz.constants.js';
import { getIO } from '../../../socket/socket.server.js';

export class AnswerAutosaveService {
  /**
   * Idempotent answer upsert with client-sequence staleness guard.
   */
  static async saveAnswer({ attemptId, attemptQuestionId, studentId, answerPayload, isFlagged, clientSequence, timeSpentSeconds }) {
    // Load attempt and verify state
    const attempt = await QuizAttempt.findById(attemptId).lean();
    if (!attempt) throw ApiError.notFound('Attempt not found');
    if (attempt.studentId.toString() !== studentId.toString()) throw ApiError.forbidden('Not your attempt');
    if (!ACTIVE_ATTEMPT_STATUSES.includes(attempt.status)) {
      throw ApiError.conflict(`Attempt is ${attempt.status} — no further saves allowed`);
    }

    // Verify not expired (server-authoritative)
    const now = new Date();
    if (attempt.expiresAt && now > attempt.expiresAt) {
      throw ApiError.conflict('Attempt has expired. Submit is locked.');
    }

    // Verify the question belongs to this attempt
    const attemptQuestion = await QuizAttemptQuestion.findOne({ _id: attemptQuestionId, attemptId }).lean();
    if (!attemptQuestion) throw ApiError.badRequest('Question does not belong to this attempt');

    // Load existing answer to check sequence staleness
    const existing = await QuizAnswer.findOne({ attemptId, attemptQuestionId }).lean();
    if (existing && clientSequence !== undefined && existing.clientSequence >= clientSequence) {
      // Stale write — return current saved state
      return { saved: false, stale: true, currentSaveVersion: existing.saveVersion };
    }

    // Compute new server save version
    const newSaveVersion = (existing?.saveVersion || 0) + 1;

    const updateData = {
      quizId: attempt.quizId,
      studentId,
      answerType: attemptQuestion.type,
      isFlagged: isFlagged ?? existing?.isFlagged ?? false,
      lastSavedAt: now,
      saveVersion: newSaveVersion,
      clientSequence: clientSequence ?? 0,
      timeSpentSeconds: Math.min(timeSpentSeconds || 0, attempt.durationSeconds || 86400),
      status: 'saved',
    };

    // Type-specific payload
    if (answerPayload.selectedOptionIds !== undefined) {
      updateData.selectedOptionIds = answerPayload.selectedOptionIds;
    }
    if (answerPayload.booleanAnswer !== undefined) {
      updateData.booleanAnswer = answerPayload.booleanAnswer;
    }
    if (answerPayload.textAnswer !== undefined) {
      updateData.textAnswer = answerPayload.textAnswer;
    }
    if (answerPayload.codeAnswer !== undefined) {
      updateData.codeAnswer = answerPayload.codeAnswer;
      updateData.language = answerPayload.language || '';
    }
    if (!existing) {
      updateData.firstAnsweredAt = now;
    }

    const answer = await QuizAnswer.findOneAndUpdate(
      { attemptId, attemptQuestionId },
      { $set: updateData, $inc: { visitCount: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update attempt last-activity and answered count
    const allAnswers = await QuizAnswer.countDocuments({ attemptId, status: 'saved' });
    await QuizAttempt.updateOne(
      { _id: attemptId },
      {
        $set: {
          lastActivityAt: now,
          answeredCount: allAnswers,
          flaggedCount: await QuizAnswer.countDocuments({ attemptId, isFlagged: true }),
          autosaveVersion: newSaveVersion,
          remainingSecondsAtLastSave: Math.max(0, Math.floor((attempt.expiresAt - now) / 1000)),
        },
      }
    );

    // Record event
    await QuizAttemptEvent.create({
      attemptId,
      quizId: attempt.quizId,
      studentId,
      eventType: 'answer_saved',
      metadata: { attemptQuestionId, saveVersion: newSaveVersion },
      serverTimestamp: now,
    });

    // Emit confirm to student
    try {
      const io = getIO();
      io.to(`attempt:${attemptId}`).emit('quiz:answer_saved', {
        attemptQuestionId,
        saveVersion: newSaveVersion,
        savedAt: now,
      });
    } catch (_) {}

    return { saved: true, saveVersion: newSaveVersion, savedAt: now };
  }
}
