import api from './api.js';

export const attendanceCorrectionService = {
  correctRecord: (recordId, { newStatus, reason, evidence }) =>
    api.post(`/attendance/records/${recordId}/correct`, { newStatus, reason, evidence }),

  getCorrectionHistory: (recordId) => api.get(`/attendance/records/${recordId}/corrections`),
};
