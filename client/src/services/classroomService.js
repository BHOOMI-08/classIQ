import api from './api';

export const classroomService = {
  createClassroom: async (classroomData) => {
    return api.post('/classrooms', classroomData);
  },

  getTeacherClassrooms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/classrooms/teacher?${query}` : '/classrooms/teacher';
    return api.get(url);
  },

  getClassroomById: async (classId) => {
    return api.get(`/classrooms/${classId}`);
  },

  updateClassroom: async (classId, data) => {
    return api.patch(`/classrooms/${classId}`, data);
  },

  archiveClassroom: async (classId) => {
    return api.post(`/classrooms/${classId}/archive`);
  },

  restoreClassroom: async (classId) => {
    return api.post(`/classrooms/${classId}/restore`);
  },

  regenerateJoinCode: async (classId) => {
    return api.post(`/classrooms/${classId}/regenerate-code`);
  },
};

export default classroomService;
