import { api } from '../../../services/api.js';

export const pollService = {
  createPoll: (classId, data) => api.post(`/classes/${classId}/polls`, data),
  getClassroomPolls: (classId) => api.get(`/classes/${classId}/polls`),
  getPollById: (pollId) => api.get(`/polls/${pollId}`),
  startPoll: (pollId, durationMinutes) => api.post(`/polls/${pollId}/start`, { durationMinutes }),
  respondPoll: (pollId, data) => api.post(`/student/polls/${pollId}/respond`, data),
  closePoll: (pollId) => api.post(`/polls/${pollId}/close`),
  revealAnswer: (pollId) => api.post(`/polls/${pollId}/reveal-answer`),
};
