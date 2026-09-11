import { Doubt } from '../models/doubt.model.js';
import { calculateDoubtPriorityScore } from '../utils/engagementScoring.utils.js';

export class DoubtPriorityService {
  /**
   * Recalculate priority score for a single doubt.
   */
  static async recalculatePriority(doubtId) {
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) return null;

    const isUnresolved = doubt.status === 'open' || doubt.status === 'grouped' || doubt.status === 'acknowledged';
    const score = calculateDoubtPriorityScore({
      upvoteCount: doubt.upvoteCount,
      similarDoubtCount: doubt.similarDoubtCount,
      createdAt: doubt.createdAt,
      isUnresolved,
    });

    doubt.priorityScore = score;
    await doubt.save();
    return score;
  }

  /**
   * Batch recalculate priorities for all open doubts in a classroom.
   */
  static async recalculateClassroomPriorities(classroomId) {
    const openDoubts = await Doubt.find({ classroomId, status: { $in: ['open', 'grouped', 'acknowledged'] } });
    for (const d of openDoubts) {
      await this.recalculatePriority(d._id);
    }
  }
}
