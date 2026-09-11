import api from './api';

export const rubricService = {
  createRubric: async (assignmentId, data) => {
    return api.post(`/assignments/${assignmentId}/rubric`, data);
  },

  getRubric: async (assignmentId) => {
    return api.get(`/assignments/${assignmentId}/rubric`);
  },
};
