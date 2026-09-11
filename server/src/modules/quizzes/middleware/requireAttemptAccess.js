import { QuizAttempt } from '../models/quizAttempt.model.js';
import { ApiError } from '../../../utils/api-error.js';
import { ACTIVE_ATTEMPT_STATUSES } from '../utils/quiz.constants.js';

export const requireActiveAttempt = async (req, _res, next) => {
  try {
    const attemptId = req.params.attemptId;
    if (!attemptId) return next(ApiError.badRequest('Attempt ID is required'));

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return next(ApiError.notFound('Attempt not found'));

    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Not your attempt'));
    }

    if (!ACTIVE_ATTEMPT_STATUSES.includes(attempt.status)) {
      return next(ApiError.conflict(`Attempt is no longer active (status: ${attempt.status})`));
    }

    // Server-authoritative expiry check
    if (attempt.expiresAt && new Date() > attempt.expiresAt) {
      return next(ApiError.conflict('Attempt has expired. Please submit.'));
    }

    req.attempt = attempt;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAttemptOwner = async (req, _res, next) => {
  try {
    const attemptId = req.params.attemptId;
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return next(ApiError.notFound('Attempt not found'));
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('Not your attempt'));
    }
    req.attempt = attempt;
    next();
  } catch (err) {
    next(err);
  }
};
