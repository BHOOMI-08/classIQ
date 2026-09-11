import api from './api';

export const resourceProgressService = {
  recordOpen: async (resourceId) => {
    return api.post(`/student/resources/${resourceId}/open`);
  },

  markCompleted: async (resourceId) => {
    return api.post(`/student/resources/${resourceId}/complete`);
  },

  updateProgress: async (resourceId, percentage) => {
    return api.patch(`/student/resources/${resourceId}/progress`, { progressPercentage: percentage });
  },
};
