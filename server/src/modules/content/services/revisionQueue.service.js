import { RevisionQueueItem } from '../models/revisionQueueItem.model.js';

export class RevisionQueueService {
  static async addToQueue({ studentId, classroomId, resourceId, priority = 'medium', reason, source = 'manual' }) {
    return RevisionQueueItem.findOneAndUpdate(
      { studentId, resourceId, status: { $in: ['pending', 'in_progress'] } },
      { $set: { classroomId, priority, reason: reason || 'Manual exam review', source } },
      { upsert: true, new: true }
    );
  }

  static async removeFromQueue({ studentId, resourceId }) {
    return RevisionQueueItem.findOneAndUpdate(
      { studentId, resourceId, status: { $in: ['pending', 'in_progress'] } },
      { $set: { status: 'removed' } },
      { new: true }
    );
  }

  static async getStudentRevisionQueue(studentId) {
    return RevisionQueueItem.find({ studentId, status: { $in: ['pending', 'in_progress'] } })
      .populate('resourceId', 'title resourceType topic unit status estimatedReadingMinutes')
      .sort({ createdAt: -1 })
      .lean();
  }
}
