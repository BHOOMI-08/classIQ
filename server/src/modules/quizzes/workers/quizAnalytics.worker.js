import { QuizProcessingJob } from '../models/quizProcessingJob.model.js';
import { QuizAnalyticsService } from '../services/quizAnalytics.service.js';
import { Quiz } from '../models/quiz.model.js';
import { logger } from '../../../utils/logger.js';

const WORKER_ID = `analytics-worker-${process.pid}`;

export class QuizAnalyticsWorker {
  static async startWorker() {
    setInterval(async () => {
      try {
        const job = await QuizProcessingJob.findOneAndUpdate(
          {
            jobType: 'recalculate_quiz_analytics',
            status: 'pending',
            scheduledFor: { $lte: new Date() },
            $or: [{ lockedAt: null }, { lockedAt: { $lt: new Date(Date.now() - 180000) } }],
          },
          {
            $set: { status: 'running', lockedAt: new Date(), lockedBy: WORKER_ID, startedAt: new Date() },
            $inc: { attempts: 1 },
          },
          { new: true }
        );

        if (!job) return;

        try {
          const quiz = await Quiz.findById(job.quizId).lean();
          if (quiz) {
            await QuizAnalyticsService.computeQuizAnalytics(quiz._id, quiz.classroomId);
            await QuizAnalyticsService.computeQuestionAnalytics(quiz._id);
          }
          job.status = 'completed';
          job.completedAt = new Date();
          await job.save();
          logger.info(`📊 Analytics computed for quiz ${job.quizId}`);
        } catch (err) {
          job.status = job.attempts >= job.maxAttempts ? 'failed' : 'pending';
          job.failedAt = new Date();
          job.lastErrorMessage = err.message;
          job.lockedAt = null;
          await job.save();
          logger.error(`Analytics job failed: ${err.message}`);
        }
      } catch (err) {
        logger.error('QuizAnalyticsWorker error:', err.message);
      }
    }, 60000); // Every 60 seconds
  }
}
