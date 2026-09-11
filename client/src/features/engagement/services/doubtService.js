import { api } from '../../../services/api.js';

export const doubtService = {
  submitDoubt: (classId, data) => api.post(`/student/classes/${classId}/doubts`, data),
  getMyDoubts: (classId) => api.get(`/student/classes/${classId}/doubts/me`),
  getClassroomDoubts: (classId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/classes/${classId}/doubts${query ? `?${query}` : ''}`);
  },
  upvoteDoubt: (doubtId) => api.post(`/doubts/${doubtId}/upvote`),
  removeUpvote: (doubtId) => api.delete(`/doubts/${doubtId}/upvote`),
  resolveDoubt: (doubtId, resolutionNote) => api.post(`/doubts/${doubtId}/resolve`, { resolutionNote }),
  rebuildClusters: (classId) => api.post(`/classes/${classId}/doubt-clusters/rebuild`),
};
