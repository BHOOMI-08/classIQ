import { connectSocket, getSocket } from './socketClient.js';

export const subscribeTeacherAttendance = ({ sessionId, classroomId }) => {
  const socket = connectSocket();
  socket.emit('attendance:subscribe-teacher', { sessionId, classroomId });
};

export const unsubscribeTeacherAttendance = ({ sessionId }) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('attendance:unsubscribe-teacher', { sessionId });
  }
};

export const subscribeStudentAttendance = ({ sessionId, classroomId }) => {
  const socket = connectSocket();
  socket.emit('attendance:subscribe-student', { sessionId, classroomId });
};

export const unsubscribeStudentAttendance = ({ sessionId }) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('attendance:unsubscribe-student', { sessionId });
  }
};
