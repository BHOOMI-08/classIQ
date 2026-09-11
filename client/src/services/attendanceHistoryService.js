import api from './api.js';

export const attendanceHistoryService = {
  getSessionRecords: (sessionId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/attendance/sessions/${sessionId}/records${query ? `?${query}` : ''}`);
  },

  getSessionAttempts: (sessionId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/attendance/sessions/${sessionId}/attempts${query ? `?${query}` : ''}`);
  },

  getMyRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/attendance/my-records${query ? `?${query}` : ''}`);
  },
};
