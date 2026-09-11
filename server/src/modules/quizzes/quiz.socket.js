import { QuizAttempt } from './models/quizAttempt.model.js';
import { logger } from '../../utils/logger.js';

export const registerQuizSocketHandlers = (io) => {
  const quizNsp = io.of('/quiz');

  quizNsp.on('connection', (socket) => {
    const user = socket.user;
    if (!user) return socket.disconnect();

    logger.info(`🎮 Quiz socket connected: ${user._id} (${user.role})`);

    // Student joins their attempt room
    socket.on('join_attempt', async ({ attemptId }) => {
      try {
        const attempt = await QuizAttempt.findById(attemptId).lean();
        if (!attempt) return socket.emit('error', { message: 'Attempt not found' });
        if (attempt.studentId.toString() !== user._id.toString()) return socket.emit('error', { message: 'Unauthorized' });

        socket.join(`attempt:${attemptId}`);

        // Timer sync — send server-authoritative remaining time
        const now = new Date();
        const remainingSeconds = attempt.expiresAt
          ? Math.max(0, Math.floor((attempt.expiresAt - now) / 1000))
          : null;

        socket.emit('quiz:timer_sync', {
          attemptId,
          serverTime: now,
          expiresAt: attempt.expiresAt,
          remainingSeconds,
          status: attempt.status,
        });

        logger.info(`Student ${user._id} joined attempt room: ${attemptId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Teacher joins monitoring room
    socket.on('join_quiz_monitor', ({ quizId }) => {
      if (user.role !== 'teacher' && user.role !== 'admin') return;
      socket.join(`quiz_monitor:${quizId}`);
      logger.info(`Teacher ${user._id} joined quiz monitor: ${quizId}`);
    });

    // Student joins classroom quiz broadcast room
    socket.on('join_classroom_quizzes', ({ classroomId }) => {
      socket.join(`classroom:${classroomId}`);
    });

    // Personal room for result release notifications
    socket.join(`student:${user._id}`);

    socket.on('disconnect', () => {
      logger.info(`Quiz socket disconnected: ${user._id}`);
    });
  });
};
