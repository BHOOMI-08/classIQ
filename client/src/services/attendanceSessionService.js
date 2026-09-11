import api from './api.js';

export const attendanceSessionService = {
  startSession: (classroomId, payload) =>
    api.post(`/classrooms/${classroomId}/attendance/sessions`, payload),

  getActiveSession: (classroomId, options = {}) =>
    api.get(`/classrooms/${classroomId}/attendance/active-session`, options),

  getCurrentQrToken: (sessionId, options = {}) =>
    api.get(`/attendance/sessions/${sessionId}/qr-token`, options),

  endSession: (sessionId, reason = 'Teacher ended session') =>
    api.post(`/attendance/sessions/${sessionId}/end`, { reason }),

  cancelSession: (sessionId, reason = 'Teacher cancelled session') =>
    api.post(`/attendance/sessions/${sessionId}/cancel`, { reason }),
};
