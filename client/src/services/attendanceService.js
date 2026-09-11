import api from './api';

export const attendanceService = {
  startSession: async (classroomId, durationSeconds = 300) => {
    return api.post('/attendance/session/start', { classroomId, durationSeconds });
  },

  getRotatingPayload: async (sessionId) => {
    return api.get(`/attendance/session/${sessionId}/token`);
  },

  scanQR: async (token) => {
    return api.post('/attendance/scan', { token });
  },

  getAttendanceHistory: async (classroomId) => {
    return api.get(`/attendance/history/${classroomId}`);
  },
};

export default attendanceService;
