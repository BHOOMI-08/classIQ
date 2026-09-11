import api from './api';

export const contentResourceService = {
  getResources: async (classId) => {
    return api.get(`/classes/${classId}/resources`);
  },

  getResourceDetails: async (resourceId) => {
    return api.get(`/resources/${resourceId}`);
  },

  createResource: async (classId, formData) => {
    const isFormData = formData instanceof FormData;
    return api.post(`/classes/${classId}/resources/upload`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  publishResource: async (resourceId) => {
    return api.post(`/resources/${resourceId}/publish`);
  },

  unpublishResource: async (resourceId) => {
    return api.post(`/resources/${resourceId}/unpublish`);
  },

  replaceVersion: async (resourceId, formData) => {
    const isFormData = formData instanceof FormData;
    return api.post(`/resources/${resourceId}/versions`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  getVersions: async (resourceId) => {
    return api.get(`/resources/${resourceId}/versions`);
  },
};
