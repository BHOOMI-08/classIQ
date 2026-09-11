import api from './api.js';

export const attendanceAnalyticsService = {
  getTeacherOverview: (classroomId, params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/attendance/analytics/classrooms/${classroomId}/overview${query ? `?${query}` : ''}`, options);
  },

  getTeacherTrends: (classroomId, params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/attendance/analytics/classrooms/${classroomId}/trends${query ? `?${query}` : ''}`, options);
  },

  getTeacherSessions: (classroomId, params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/attendance/analytics/classrooms/${classroomId}/sessions${query ? `?${query}` : ''}`, options);
  },

  getTeacherSecurity: (classroomId, params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/attendance/analytics/classrooms/${classroomId}/security${query ? `?${query}` : ''}`, options);
  },

  getTeacherStudentInsight: (classroomId, studentId, options = {}) => {
    return api.get(`/attendance/analytics/classrooms/${classroomId}/students/${studentId}`, options);
  },

  getMyHealth: (options = {}) => {
    return api.get('/attendance/analytics/me/health', options);
  },

  getMyClassHealth: (classroomId, options = {}) => {
    return api.get(`/attendance/analytics/me/classes/${classroomId}/health`, options);
  },
};
