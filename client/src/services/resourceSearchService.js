import api from './api';

export const resourceSearchService = {
  hybridSearch: async (classId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/classes/${classId}/resources/search?${query}`);
  },

  semanticSearch: async (classId, query) => {
    return api.post(`/classes/${classId}/resources/semantic-search`, { query });
  },
};
