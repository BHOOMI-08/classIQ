import { Classroom } from '../classrooms/classroom.model.js';
import { Enrollment } from '../enrollments/enrollment.model.js';
import { logger } from '../../utils/logger.js';

export function registerEngagementSocketHandlers(io) {
  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (!user) return;

    // Join Engagement Room
    socket.on('join:classroom-engagement', async ({ classroomId }) => {
      try {
        let authorized = false;
        if (user.role === 'teacher' || user.role === 'admin') {
          const classroom = await Classroom.findById(classroomId).lean();
          if (classroom && (user.role === 'admin' || classroom.teacherId.toString() === user._id.toString())) {
            authorized = true;
          }
        } else if (user.role === 'student') {
          const enrollment = await Enrollment.findOne({ classroomId, studentId: user._id, status: 'active' }).lean();
          if (enrollment) authorized = true;
        }

        if (authorized) {
          const roomName = `classroom:${classroomId}:engagement`;
          socket.join(roomName);
          logger.info(`Socket ${socket.id} (${user.role} ${user._id}) joined ${roomName}`);
        } else {
          socket.emit('engagement:error', { message: 'Unauthorized room access' });
        }
      } catch (err) {
        socket.emit('engagement:error', { message: err.message });
      }
    });

    // Leave Room
    socket.on('leave:classroom-engagement', ({ classroomId }) => {
      const roomName = `classroom:${classroomId}:engagement`;
      socket.leave(roomName);
    });
  });
}
