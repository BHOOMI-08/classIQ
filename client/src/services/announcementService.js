import api from './api';

export const announcementService = {
  getAnnouncements: async (classId) => {
    return api.get(`/classrooms/${classId}/announcements`);
  },

  createAnnouncement: async (classId, data) => {
    return api.post(`/classrooms/${classId}/announcements`, data);
  },

  updateAnnouncement: async (announcementId, data) => {
    return api.patch(`/announcements/${announcementId}`, data);
  },

  publishAnnouncement: async (announcementId) => {
    return api.post(`/announcements/${announcementId}/publish`);
  },

  archiveAnnouncement: async (announcementId) => {
    return api.post(`/announcements/${announcementId}/archive`);
  },
};

export default announcementService;
