import { ClassroomActivity } from '../models/classroomActivity.model.js';
import { getIO } from '../../../socket/socket.server.js';
import { logger } from '../../../utils/logger.js';

export class EngagementActivityService {
  /**
   * Log classroom timeline activity and broadcast real-time event.
   */
  static async logActivity({
    classroomId,
    actorId,
    actorRole,
    eventType,
    sourceModule,
    sourceId,
    title,
    summary = '',
    metadata = {},
    visibility = 'all_members',
  }) {
    try {
      const activity = await ClassroomActivity.create({
        classroomId,
        actorId,
        actorRole,
        eventType,
        sourceModule,
        sourceId,
        title,
        summary,
        metadata,
        visibility,
        occurredAt: new Date(),
      });

      // Broadcast real-time event to authorized classroom room
      try {
        const io = getIO();
        io.to(`classroom:${classroomId}:engagement`).emit('engagement:timeline-updated', { activity });
      } catch (_) {
        // Socket may not be initialized in test runner
      }

      return activity;
    } catch (err) {
      logger.error('Failed to log classroom activity:', { error: err.message });
      return null;
    }
  }
}
