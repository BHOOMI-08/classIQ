import api from './api.js';

export const attendanceSubmissionService = {
  submitAttendance: (payload) => api.post('/attendance/submit', payload),

  registerDevice: (payload) => api.post('/attendance/devices', payload),

  getUserDevices: () => api.get('/attendance/devices'),
};
