import { attendanceEvents, EVENT_TYPES } from './attendanceEventEmitter.js';
import { ROOMS, canJoinTeacherSessionRoom, canJoinStudentSessionRoom } from '../../socket/socket.rooms.js';
import { AttendanceSession } from './attendanceSession.model.js';
import { AttendanceSessionService } from './attendanceSession.service.js';
import { logger } from '../../utils/logger.js';

export const registerAttendanceSocketHandlers = (io) => {
  // Listen for socket connections
  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${user?.email || 'unknown'})`);

    // Client requests to subscribe to teacher live session updates
    socket.on('attendance:subscribe-teacher', async ({ sessionId, classroomId }) => {
      try {
        if (!user) return socket.emit('attendance:error', { message: 'Unauthorized' });
        const authorized = await canJoinTeacherSessionRoom(user, classroomId);
        if (!authorized) {
          return socket.emit('attendance:error', { message: 'Forbidden to join teacher session room' });
        }

        const teacherRoom = ROOMS.teacherSessionRoom(sessionId);
        const securityRoom = ROOMS.attendanceSecurityRoom(sessionId);
        socket.join(teacherRoom);
        socket.join(securityRoom);

        logger.info(`Teacher ${user.email} joined rooms: ${teacherRoom}, ${securityRoom}`);
        socket.emit('attendance:subscribed', { room: teacherRoom, role: 'teacher' });
      } catch (err) {
        socket.emit('attendance:error', { message: err.message });
      }
    });

    // Client requests to subscribe to student private session status
    socket.on('attendance:subscribe-student', async ({ sessionId, classroomId }) => {
      try {
        if (!user) return socket.emit('attendance:error', { message: 'Unauthorized' });
        const authorized = await canJoinStudentSessionRoom(user, classroomId, user._id.toString());
        if (!authorized) {
          return socket.emit('attendance:error', { message: 'Forbidden to join student session room' });
        }

        const studentRoom = ROOMS.studentSessionRoom(sessionId, user._id.toString());
        socket.join(studentRoom);
        socket.emit('attendance:subscribed', { room: studentRoom, role: 'student' });
      } catch (err) {
        socket.emit('attendance:error', { message: err.message });
      }
    });

    // Handle manual unsubscribe
    socket.on('attendance:unsubscribe-teacher', ({ sessionId }) => {
      socket.leave(ROOMS.teacherSessionRoom(sessionId));
      socket.leave(ROOMS.attendanceSecurityRoom(sessionId));
    });

    socket.on('attendance:unsubscribe-student', ({ sessionId }) => {
      if (user) {
        socket.leave(ROOMS.studentSessionRoom(sessionId, user._id.toString()));
      }
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Wire Internal Domain Events to Socket Broadcasts
  attendanceEvents.on(EVENT_TYPES.ATTENDANCE_JOINED, (data) => {
    const { sessionId, student, status, lateByMinutes } = data;
    io.to(ROOMS.teacherSessionRoom(sessionId)).emit('attendance:joined', {
      sessionId,
      record: {
        id: data.recordId || data.sessionId,
        student,
        status,
        markedAt: new Date().toISOString(),
        lateByMinutes,
        suspicionLevel: 'low',
      },
    });

    io.to(ROOMS.studentSessionRoom(sessionId, student.id)).emit('attendance:status-update', {
      sessionId,
      decision: 'accepted',
      status,
      lateByMinutes,
      markedAt: new Date().toISOString(),
    });
  });

  attendanceEvents.on(EVENT_TYPES.ATTENDANCE_FLAGGED, (data) => {
    const { sessionId, studentId, suspicionScore } = data;
    io.to(ROOMS.attendanceSecurityRoom(sessionId)).emit('attendance:flagged', {
      sessionId,
      studentId,
      suspicionScore,
      createdAt: new Date().toISOString(),
    });

    io.to(ROOMS.studentSessionRoom(sessionId, studentId)).emit('attendance:status-update', {
      sessionId,
      decision: 'pending_review',
      status: 'pending_review',
      message: 'Your submission requires teacher review.',
    });
  });

  attendanceEvents.on(EVENT_TYPES.ATTENDANCE_SESSION_STARTED, (data) => {
    const { sessionId, classroomId, startedAt } = data;
    io.to(ROOMS.classroomAttendanceRoom(classroomId)).emit('attendance:session-started', {
      sessionId,
      classroomId,
      startedAt,
    });
  });

  attendanceEvents.on(EVENT_TYPES.ATTENDANCE_SESSION_ENDED, (data) => {
    const { sessionId, classroomId, endedAt } = data;
    io.to(ROOMS.teacherSessionRoom(sessionId)).emit('attendance:session-ended', { sessionId, endedAt });
    io.to(ROOMS.classroomAttendanceRoom(classroomId)).emit('attendance:session-ended', { sessionId, endedAt });
  });

  // Automated QR Rotation Timer Broadcast (Every 15 Seconds for Active Sessions)
  setInterval(async () => {
    try {
      const activeSessions = await AttendanceSession.find({ status: 'active' });
      for (const session of activeSessions) {
        const { qrToken, rotation, expiresAt, remainingSeconds } = await AttendanceSessionService.getCurrentQrToken(session);
        io.to(ROOMS.teacherSessionRoom(session._id.toString())).emit('attendance:qr-rotated', {
          sessionId: session._id,
          rotation,
          token: qrToken,
          issuedAt: Date.now(),
          expiresAt,
          remainingSeconds: remainingSeconds ?? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
        });
      }
    } catch (err) {
      logger.error('Failed to broadcast rotating QR tokens:', { error: err.message });
    }
  }, 15000);
};
