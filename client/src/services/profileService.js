import api from './api';

export const profileService = {
  getProfile: async () => {
    return api.get('/profile');
  },

  updateProfile: async (formData) => {
    return api.patch('/profile', formData);
  },

  uploadAvatar: async (formData) => {
    return api.post('/profile/avatar', formData);
  },

  deleteAvatar: async () => {
    return api.delete('/profile/avatar');
  },

  deactivateAccount: async (password) => {
    return api.post('/profile/deactivate', { password });
  },

  getSessions: async () => {
    return api.get('/sessions');
  },

  revokeSession: async (sessionId) => {
    return api.delete(`/sessions/${sessionId}`);
  },

  revokeOtherSessions: async () => {
    return api.post('/sessions/revoke-others');
  },
};

export default profileService;
