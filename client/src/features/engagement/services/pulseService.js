import { api } from '../../../services/api.js';

export const pulseService = {
  createPulse: (classId, data) => api.post(`/classes/${classId}/pulses`, data),
  getClassroomPulses: (classId) => api.get(`/classes/${classId}/pulses`),
  getPulseById: (pulseId) => api.get(`/pulses/${pulseId}`),
  respondPulse: (pulseId, response) => api.post(`/student/pulses/${pulseId}/respond`, { response }),
  closePulse: (pulseId) => api.post(`/pulses/${pulseId}/close`),
};
