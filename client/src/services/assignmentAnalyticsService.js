import api from './api';

export const assignmentAnalyticsService = {
  getAnalytics: async (assignmentId) => {
    return api.get(`/assignments/${assignmentId}/analytics`);
  },

  getExportCSVUrl: (assignmentId) => {
    return `${api.defaults.baseURL || '/api/v1'}/assignments/${assignmentId}/export/results.csv`;
  },
};
