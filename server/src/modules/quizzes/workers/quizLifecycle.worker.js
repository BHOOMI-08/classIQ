import { Quiz } from '../models/quiz.model.js';
import { QUIZ_STATUS } from '../utils/quiz.constants.js';
import { logger } from '../../../utils/logger.js';

export class QuizLifecycleWorker {
  static async startWorker() {
    setInterval(async () => {
      try {
        const now = new Date();

        // 1. Publish scheduled quizzes
        const scheduled = await Quiz.find({ status: QUIZ_STATUS.SCHEDULED, scheduledPublishAt: { $lte: now } });
        for (const quiz of scheduled) {
          quiz.status = QUIZ_STATUS.PUBLISHED;
          quiz.publishedAt = now;
          await quiz.save();
          logger.info(`📢 Scheduled quiz published: ${quiz.title} (${quiz._id})`);
        }

        // 2. Activate published quizzes whose openingAt has been reached
        const toActivate = await Quiz.find({
          status: QUIZ_STATUS.PUBLISHED,
          openingAt: { $ne: null, $lte: now },
        });
        for (const quiz of toActivate) {
          quiz.status = QUIZ_STATUS.ACTIVE;
          await quiz.save();
          logger.info(`✅ Quiz activated: ${quiz.title} (${quiz._id})`);
        }

        // 3. Close active/published quizzes past their closingAt
        const toClose = await Quiz.find({
          status: { $in: [QUIZ_STATUS.PUBLISHED, QUIZ_STATUS.ACTIVE] },
          closingAt: { $ne: null, $lte: now },
        });
        for (const quiz of toClose) {
          quiz.status = QUIZ_STATUS.CLOSED;
          await quiz.save();
          logger.info(`🔒 Quiz auto-closed: ${quiz.title} (${quiz._id})`);
        }
      } catch (err) {
        logger.error('QuizLifecycleWorker error:', { error: err.message });
      }
    }, 30000); // Every 30 seconds
  }
}
