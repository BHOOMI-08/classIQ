import api from './api';

export const enrollmentService = {
  joinClassroom: async (joinCode) => {
    return api.post('/enrollments/join', { joinCode });
  },

  getStudentClassrooms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/enrollments/me?${query}` : '/enrollments/me';
    return api.get(url);
  },

  leaveClassroom: async (classId) => {
    return api.post(`/enrollments/${classId}/leave`);
  },

  getClassroomStudents: async (classId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/classrooms/${classId}/students?${query}` : `/classrooms/${classId}/students`;
    return api.get(url);
  },

  removeStudent: async (classId, studentId) => {
    return api.patch(`/classrooms/${classId}/students/${studentId}/remove`);
  },

  blockStudent: async (classId, studentId, reason = '') => {
    return api.patch(`/classrooms/${classId}/students/${studentId}/block`, { reason });
  },

  unblockStudent: async (classId, studentId) => {
    return api.patch(`/classrooms/${classId}/students/${studentId}/unblock`);
  },
};

export default enrollmentService;
