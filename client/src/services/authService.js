import api from './api';

export const authService = {
  login: async (email, password, rememberDevice = false) => {
    return api.post('/auth/login', { email, password, rememberDevice });
  },

  registerStudent: async (studentData) => {
    return api.post('/auth/register/student', studentData);
  },

  registerTeacher: async (teacherData) => {
    return api.post('/auth/register/teacher', teacherData);
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  refresh: async () => {
    return api.post('/auth/refresh');
  },

  changePassword: async (oldPassword, newPassword) => {
    return api.put('/auth/password/change', { oldPassword, newPassword });
  },

  sendVerificationEmail: async () => {
    return api.post('/auth/email/send-verification');
  },

  verifyEmail: async (token) => {
    return api.post('/auth/email/verify', { token });
  },

  forgotPassword: async (email) => {
    return api.post('/auth/password/forgot', { email });
  },

  resetPassword: async (token, password) => {
    return api.post('/auth/password/reset', { token, password });
  },
};

export default authService;
