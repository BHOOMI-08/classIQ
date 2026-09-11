import { Quiz } from '../models/quiz.model.js';
import { QuizAttempt } from '../models/quizAttempt.model.js';
import { QuizAccessGrant } from '../models/quizAccessGrant.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { QUIZ_STATUS, ACTIVE_ATTEMPT_STATUSES, TERMINAL_ATTEMPT_STATUSES, ELIGIBILITY } from '../utils/quiz.constants.js';

export class QuizAccessService {
  /**
   * Central eligibility resolver. Returns { eligible, reason, activeAttempt, grant, effectiveAttemptLimit, effectiveDurationMinutes, effectiveOpeningAt, effectiveClosingAt }
   */
  static async resolveEligibility(quizId, studentId) {
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return { eligible: false, reason: ELIGIBILITY.ACCESS_DENIED };

    // Check enrollment
    const enrollment = await Enrollment.findOne({ classroomId: quiz.classroomId, studentId, status: 'active' }).lean();
    if (!enrollment) return { eligible: false, reason: ELIGIBILITY.ACCESS_DENIED };

    // Cancelled/Archived
    if ([QUIZ_STATUS.CANCELLED, QUIZ_STATUS.ARCHIVED].includes(quiz.status)) {
      return { eligible: false, reason: ELIGIBILITY.CLOSED };
    }

    // Draft/Scheduled = not yet visible to students
    if ([QUIZ_STATUS.DRAFT, QUIZ_STATUS.SCHEDULED].includes(quiz.status)) {
      return { eligible: false, reason: ELIGIBILITY.UPCOMING };
    }

    // Resolve student-specific access grant
    const grant = await QuizAccessGrant.findOne({ quizId, studentId, status: 'active' }).lean();

    const effectiveOpeningAt = grant?.extendedOpeningAt || quiz.openingAt;
    const effectiveClosingAt = grant?.extendedClosingAt || quiz.closingAt;
    const effectiveAttemptLimit = quiz.attemptLimit + (grant?.extraAttempts || 0);
    const effectiveDurationMinutes = quiz.durationMinutes + (grant?.extraDurationMinutes || 0);

    const now = new Date();

    // Check if quiz is upcoming (published but not yet open)
    if (effectiveOpeningAt && now < effectiveOpeningAt) {
      return { eligible: false, reason: ELIGIBILITY.UPCOMING, quiz, grant, effectiveOpeningAt, effectiveClosingAt };
    }

    // Check if quiz window has closed
    if (effectiveClosingAt && now > effectiveClosingAt) {
      // Still check for in-progress attempt
      const activeAttempt = await QuizAttempt.findOne({ quizId, studentId, status: { $in: ACTIVE_ATTEMPT_STATUSES } }).lean();
      if (activeAttempt) return { eligible: true, reason: ELIGIBILITY.IN_PROGRESS, activeAttempt, quiz, grant, effectiveOpeningAt, effectiveClosingAt, effectiveAttemptLimit, effectiveDurationMinutes };
      return { eligible: false, reason: ELIGIBILITY.CLOSED, quiz, grant };
    }

    // Check for existing active attempt
    const activeAttempt = await QuizAttempt.findOne({ quizId, studentId, status: { $in: ACTIVE_ATTEMPT_STATUSES } }).lean();
    if (activeAttempt) {
      return { eligible: true, reason: ELIGIBILITY.IN_PROGRESS, activeAttempt, quiz, grant, effectiveOpeningAt, effectiveClosingAt, effectiveAttemptLimit, effectiveDurationMinutes };
    }

    // Check attempt limit
    const completedAttempts = await QuizAttempt.countDocuments({ quizId, studentId, status: { $in: TERMINAL_ATTEMPT_STATUSES } });
    if (completedAttempts >= effectiveAttemptLimit) {
      return { eligible: false, reason: ELIGIBILITY.EXHAUSTED, completedAttempts, effectiveAttemptLimit, quiz, grant };
    }

    // Available
    return {
      eligible: true,
      reason: ELIGIBILITY.AVAILABLE,
      quiz,
      grant,
      effectiveAttemptLimit,
      effectiveDurationMinutes,
      effectiveOpeningAt,
      effectiveClosingAt,
      completedAttempts,
    };
  }
}
