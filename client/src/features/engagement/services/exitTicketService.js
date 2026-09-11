import { api } from '../../../services/api.js';

export const exitTicketService = {
  createExitTicket: (classId, data) => api.post(`/classes/${classId}/exit-tickets`, data),
  generateAIExitTicket: (classId, data) => api.post(`/classes/${classId}/exit-tickets/ai/generate`, data),
  getClassroomExitTickets: (classId) => api.get(`/classes/${classId}/exit-tickets`),
  getExitTicketById: (ticketId) => api.get(`/exit-tickets/${ticketId}`),
  startExitTicket: (ticketId) => api.post(`/exit-tickets/${ticketId}/start`),
  submitAttempt: (ticketId, answers) => api.post(`/student/exit-tickets/${ticketId}/submit`, { answers }),
  closeExitTicket: (ticketId) => api.post(`/exit-tickets/${ticketId}/close`),
};
