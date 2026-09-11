import api from './api';

export const bookmarkService = {
  addBookmark: async (resourceId, note = '') => {
    return api.post(`/student/resources/${resourceId}/bookmark`, { note });
  },

  removeBookmark: async (resourceId) => {
    return api.delete(`/student/resources/${resourceId}/bookmark`);
  },

  getBookmarks: async () => {
    return api.get('/student/bookmarks');
  },
};
