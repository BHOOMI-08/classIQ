import api from './api';

export const scheduleService = {
  getSchedules: async (classId) => {
    return api.get(`/classrooms/${classId}/schedules`);
  },

  createSchedule: async (classId, data) => {
    return api.post(`/classrooms/${classId}/schedules`, data);
  },

  updateSchedule: async (classId, scheduleId, data) => {
    return api.patch(`/classrooms/${classId}/schedules/${scheduleId}`, data);
  },

  deleteSchedule: async (classId, scheduleId) => {
    return api.delete(`/classrooms/${classId}/schedules/${scheduleId}`);
  },
};

export default scheduleService;
