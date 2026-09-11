import { ResourceProgress } from '../models/resourceProgress.model.js';

export class ResourceProgressService {
  static async recordOpen({ resourceId, classroomId, studentId }) {
    let progress = await ResourceProgress.findOne({ resourceId, studentId });
    if (!progress) {
      progress = await ResourceProgress.create({
        resourceId,
        classroomId,
        studentId,
        status: 'in_progress',
        progressPercentage: 10,
        firstOpenedAt: new Date(),
        lastOpenedAt: new Date(),
        totalOpenCount: 1,
      });
    } else {
      progress.lastOpenedAt = new Date();
      progress.totalOpenCount += 1;
      if (progress.status === 'not_started') {
        progress.status = 'in_progress';
      }
      await progress.save();
    }
    return progress;
  }

  static async markCompleted({ resourceId, classroomId, studentId }) {
    let progress = await ResourceProgress.findOne({ resourceId, studentId });
    if (!progress) {
      progress = await ResourceProgress.create({
        resourceId,
        classroomId,
        studentId,
        status: 'completed',
        progressPercentage: 100,
        completedAt: new Date(),
        markedCompletedManually: true,
      });
    } else {
      progress.status = 'completed';
      progress.progressPercentage = 100;
      progress.completedAt = new Date();
      progress.markedCompletedManually = true;
      await progress.save();
    }
    return progress;
  }

  static async updateProgress({ resourceId, studentId, percentage }) {
    const progress = await ResourceProgress.findOne({ resourceId, studentId });
    if (!progress) return null;

    progress.progressPercentage = Math.min(100, Math.max(0, percentage));
    if (progress.progressPercentage === 100 && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();
    }
    await progress.save();
    return progress;
  }
}
