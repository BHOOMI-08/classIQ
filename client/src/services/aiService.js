import api from './api.js';

export const aiService = {
  // 1. Context-Grounded AI Tutor (RAG)
  chatTutor: (data) => api.post('/ai/tutor/chat', data),
  getTutorHistory: (classroomId) => api.get(`/ai/tutor/history${classroomId ? `?classroomId=${classroomId}` : ''}`),
  getTutorMessages: (conversationId) => api.get(`/ai/tutor/history/${conversationId}`),
  deleteTutorHistory: (id) => api.delete(`/ai/tutor/history/${id}`),

  // 2. AI Study Planner
  generateStudyPlan: (data) => api.post('/ai/study-plans', data),
  getStudyPlan: () => api.get('/ai/study-plans'),
  updateStudyTask: (id, data) => api.patch(`/ai/study-plans/${id}`, data),
  recalculateStudyPlan: (id) => api.post(`/ai/study-plans/${id}/recalculate`),

  // 3. Smart Revision Generator
  generateRevisionAsset: (data) => api.post('/ai/revision/generate', data),
  getRevisions: (classroomId) => api.get(`/ai/revision${classroomId ? `?classroomId=${classroomId}` : ''}`),
  getRevisionById: (id) => api.get(`/ai/revision/${id}`),
};

export default aiService;
