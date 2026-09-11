import api from './api';

export const resourceAIService = {
  generateSummary: async (resourceId) => {
    return api.post(`/resources/${resourceId}/ai/summary`);
  },

  generateFlashcards: async (resourceId, count = 5) => {
    return api.post(`/resources/${resourceId}/ai/flashcards`, { count });
  },

  generateRevisionQuestions: async (resourceId, count = 5) => {
    return api.post(`/resources/${resourceId}/ai/revision-questions`, { count });
  },

  getArtifacts: async (resourceId) => {
    return api.get(`/resources/${resourceId}/ai/artifacts`);
  },
};
