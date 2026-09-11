import { Assignment } from '../models/assignment.model.js';
import { logger } from '../../../utils/logger.js';

export class AssignmentLifecycleWorker {
  static async startWorker() {
    setInterval(async () => {
      try {
        const now = new Date();

        // 1. Scheduled Publication Job
        const scheduled = await Assignment.find({
          status: 'scheduled',
          scheduledPublishAt: { $lte: now },
        });

        for (const ass of scheduled) {
          ass.status = 'published';
          ass.publishedAt = now;
          await ass.save();
          logger.info(`📢 Scheduled assignment automatically published: ${ass.title} (${ass._id})`);
        }

        // 2. Auto-close Expired Assignments
        const expired = await Assignment.find({
          status: 'published',
          closingAt: { $ne: null, $lte: now },
        });

        for (const ass of expired) {
          ass.status = 'closed';
          ass.closedAt = now;
          await ass.save();
          logger.info(`🔒 Expired assignment automatically closed: ${ass.title} (${ass._id})`);
        }
      } catch (err) {
        logger.error('Error in AssignmentLifecycleWorker interval:', { error: err.message });
      }
    }, 60000); // Poll every 60 seconds
  }
}
