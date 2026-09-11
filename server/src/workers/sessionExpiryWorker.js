import { AttendanceSession } from '../modules/attendance/attendanceSession.model.js';
import { AttendanceSessionService } from '../modules/attendance/attendanceSession.service.js';
import { logger } from '../utils/logger.js';

let expiryInterval = null;

export const startSessionExpiryWorker = (intervalMs = 30000) => {
  if (expiryInterval) return;

  logger.info(`⏰ Background session expiry worker started (Interval: ${intervalMs}ms)`);

  expiryInterval = setInterval(async () => {
    try {
      const now = new Date();
      // Find active sessions whose end time has passed
      const expiredSessions = await AttendanceSession.find({
        status: 'active',
        endsAt: { $lte: now },
      }).lean();

      for (const session of expiredSessions) {
        // Atomic claim: set status to expired if it is still active
        const claimed = await AttendanceSession.findOneAndUpdate(
          { _id: session._id, status: 'active' },
          { $set: { status: 'expired', endedAt: now, endReason: 'Session duration expired automatically' } },
          { new: true }
        );

        if (claimed) {
          logger.info(`Session ${session._id} expired automatically. Marking absentees...`);
          await AttendanceSessionService.autoMarkAbsentees(claimed);
        }
      }
    } catch (err) {
      logger.error('Error in background session expiry worker:', { error: err.message });
    }
  }, intervalMs);
};

export const stopSessionExpiryWorker = () => {
  if (expiryInterval) {
    clearInterval(expiryInterval);
    expiryInterval = null;
    logger.info('⏹️ Background session expiry worker stopped');
  }
};
