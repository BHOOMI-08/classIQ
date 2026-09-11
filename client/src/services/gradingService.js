import api from './api';

export const gradingService = {
  gradeSubmission: async (submissionId, data) => {
    return api.post(`/submissions/${submissionId}/grades`, data);
  },

  returnSubmission: async (submissionId) => {
    return api.post(`/submissions/${submissionId}/return`);
  },
};
