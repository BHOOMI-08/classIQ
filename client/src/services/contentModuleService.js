import api from './api';

export const contentModuleService = {
  getModules: async (classId) => {
    return api.get(`/classes/${classId}/content/modules`);
  },

  createModule: async (classId, data) => {
    return api.post(`/classes/${classId}/content/modules`, data);
  },

  updateModule: async (classId, moduleId, data) => {
    return api.patch(`/classes/${classId}/content/modules/${moduleId}`, data);
  },

  archiveModule: async (classId, moduleId) => {
    return api.post(`/classes/${classId}/content/modules/${moduleId}/archive`);
  },

  restoreModule: async (classId, moduleId) => {
    return api.post(`/classes/${classId}/content/modules/${moduleId}/restore`);
  },
};
