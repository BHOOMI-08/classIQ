import { QuizAttempt } from '../models/quizAttempt.model.js';
import { QuizSubmissionService } from '../services/quizSubmission.service.js';
import { ACTIVE_ATTEMPT_STATUSES } from '../utils/quiz.constants.js';
import { logger } from '../../../utils/logger.js';

export class AttemptExpiryWorker {
  static async startWorker() {
    setInterval(async () => {
      try {
        const now = new Date();

        // Find all expired active attempts
        const expiredAttempts = await QuizAttempt.find({
          status: { $in: ACTIVE_ATTEMPT_STATUSES },
          expiresAt: { $ne: null, $lte: now },
        }).lean();

        for (const attempt of expiredAttempts) {
          try {
            await QuizSubmissionService.submitAttempt(attempt._id, attempt.studentId, { autoSubmit: true });
            logger.info(`⏰ Auto-submitted expired attempt: ${attempt._id} (student: ${attempt.studentId})`);
          } catch (err) {
            if (err.message?.includes('already submitted') || err.message?.includes('Cannot submit')) {
              // Already handled — skip
            } else {
              logger.error(`Failed to auto-submit attempt ${attempt._id}:`, err.message);
            }
          }
        }
      } catch (err) {
        logger.error('AttemptExpiryWorker error:', { error: err.message });
      }
    }, 20000); // Every 20 seconds for tighter timer precision
  }
}
