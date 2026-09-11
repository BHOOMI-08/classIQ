import { QuizProcessingJob } from '../models/quizProcessingJob.model.js';
import { ResultCalculationService } from '../services/resultCalculation.service.js';
import { logger } from '../../../utils/logger.js';

const WORKER_ID = `grading-worker-${process.pid}`;

export class QuizGradingWorker {
  static async startWorker() {
    setInterval(async () => {
      try {
        // Atomic claim — prevents duplicate processing
        const job = await QuizProcessingJob.findOneAndUpdate(
          {
            jobType: 'grade_attempt',
            status: 'pending',
            scheduledFor: { $lte: new Date() },
            $or: [{ lockedAt: null }, { lockedAt: { $lt: new Date(Date.now() - 120000) } }], // 2 min stale lock
          },
          {
            $set: { status: 'running', lockedAt: new Date(), lockedBy: WORKER_ID, startedAt: new Date() },
            $inc: { attempts: 1 },
          },
          { new: true }
        );

        if (!job) return;

        try {
          await ResultCalculationService.calculateResult(job.attemptId);
          job.status = 'completed';
          job.completedAt = new Date();
          await job.save();
          logger.info(`✅ Grading job complete: attempt ${job.attemptId}`);
        } catch (err) {
          job.status = job.attempts >= job.maxAttempts ? 'failed' : 'pending';
          job.failedAt = new Date();
          job.lastErrorMessage = err.message;
          job.lockedAt = null;
          job.lockedBy = null;
          await job.save();
          logger.error(`Grading job failed (attempt ${job.attempts}/${job.maxAttempts}): ${err.message}`);
        }
      } catch (err) {
        logger.error('QuizGradingWorker outer error:', err.message);
      }
    }, 15000); // Every 15 seconds
  }
}
