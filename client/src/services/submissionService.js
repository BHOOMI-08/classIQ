import api from './api';

export const submissionService = {
  saveDraft: async (assignmentId, formData) => {
    const isFormData = formData instanceof FormData;
    return api.post(`/student/assignments/${assignmentId}/submission/draft`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  submitFinal: async (assignmentId, formData) => {
    const isFormData = formData instanceof FormData;
    return api.post(`/student/assignments/${assignmentId}/submission/submit`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  getStudentSubmission: async (assignmentId) => {
    return api.get(`/student/assignments/${assignmentId}/submission`);
  },

  getSubmissionsRoster: async (assignmentId) => {
    return api.get(`/assignments/${assignmentId}/submissions`);
  },

  getSubmissionDetails: async (submissionId) => {
    return api.get(`/submissions/${submissionId}`);
  },
};
