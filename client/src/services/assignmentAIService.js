import api from './api';

export const assignmentAIService = {
  generateAssignment: async (classId, data) => {
    return api.post(`/classes/${classId}/assignments/ai/generate`, data);
  },
};
