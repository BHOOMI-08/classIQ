import { AttendanceRecord } from '../modules/attendance/attendanceRecord.model.js';
import { AttendanceSession } from '../modules/attendance/attendanceSession.model.js';
import { AttendanceAttempt } from '../modules/attendance/attendanceAttempt.model.js';
import { AttendanceCorrection } from '../modules/attendance/attendanceCorrection.model.js';
import { Enrollment } from '../modules/enrollments/enrollment.model.js';
import { logger } from '../utils/logger.js';

export const verifyDatabaseIndexes = async () => {
  try {
    logger.info('🔍 Verifying MongoDB collection indexes...');

    await Promise.all([
      AttendanceRecord.syncIndexes(),
      AttendanceSession.syncIndexes(),
      AttendanceAttempt.syncIndexes(),
      AttendanceCorrection.syncIndexes(),
      Enrollment.syncIndexes(),
    ]);

    logger.info('✅ Database indexes synchronized successfully');
  } catch (err) {
    logger.warn('Failed to synchronize database indexes automatically:', { error: err.message });
  }
};
