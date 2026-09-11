import api from './api';

export const assignmentService = {
  getAssignments: async (classId) => {
    return api.get(`/classes/${classId}/assignments`);
  },

  getAssignmentDetails: async (assignmentId) => {
    return api.get(`/assignments/${assignmentId}`);
  },

  createAssignment: async (classId, data) => {
    return api.post(`/classes/${classId}/assignments`, data);
  },

  publishAssignment: async (assignmentId) => {
    return api.post(`/assignments/${assignmentId}/publish`);
  },

  duplicateAssignment: async (assignmentId) => {
    return api.post(`/assignments/${assignmentId}/duplicate`);
  },

  archiveAssignment: async (assignmentId) => {
    return api.post(`/assignments/${assignmentId}/archive`);
  },
};
