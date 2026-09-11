import { EventEmitter } from 'events';

class AttendanceEventEmitter extends EventEmitter {}

export const attendanceEvents = new AttendanceEventEmitter();

export const EVENT_TYPES = Object.freeze({
  ATTENDANCE_JOINED: 'attendance:joined',
  ATTENDANCE_REJECTED: 'attendance:rejected',
  ATTENDANCE_FLAGGED: 'attendance:flagged',
  ATTENDANCE_LATE: 'attendance:late',
  ATTENDANCE_SESSION_STARTED: 'attendance:session-started',
  ATTENDANCE_SESSION_ENDED: 'attendance:session-ended',
  ATTENDANCE_QR_ROTATED: 'attendance:qr-rotated',
});
