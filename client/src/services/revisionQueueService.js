import api from './api';

export const revisionQueueService = {
  addToQueue: async (resourceId, options = {}) => {
    return api.post(`/student/resources/${resourceId}/revision`, options);
  },

  removeFromQueue: async (resourceId) => {
    return api.delete(`/student/resources/${resourceId}/revision`);
  },

  getRevisionQueue: async () => {
    return api.get('/student/revision');
  },
};
