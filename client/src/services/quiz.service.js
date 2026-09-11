import api from './api.js';

export const quizService = {
  // Classroom Quizzes
  getClassroomQuizzes: (classId) => api.get(`/classes/${classId}/quizzes`),
  createQuiz: (classId, data) => api.post(`/classes/${classId}/quizzes`, data),

  // Quiz Management
  getQuiz: (quizId) => api.get(`/quizzes/${quizId}`),
  updateQuiz: (quizId, data) => api.patch(`/quizzes/${quizId}`, data),
  publishQuiz: (quizId) => api.post(`/quizzes/${quizId}/publish`),
  duplicateQuiz: (quizId) => api.post(`/quizzes/${quizId}/duplicate`),
  archiveQuiz: (quizId) => api.post(`/quizzes/${quizId}/archive`),
  cancelQuiz: (quizId) => api.post(`/quizzes/${quizId}/cancel`),

  // Questions & Bank
  getQuizQuestions: (quizId) => api.get(`/quizzes/${quizId}/questions`),
  createQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
  addQuestionToQuiz: (quizId, data) => api.post(`/quizzes/${quizId}/questions/add`, data),
  getQuestionBank: (classId) => api.get(`/classes/${classId}/question-bank`),

  // AI Quiz Generation
  generateQuizAI: (classId, data) => api.post(`/classes/${classId}/quizzes/ai/generate`, data),

  // Student Attempt Lifecycle
  getEligibility: (quizId) => api.get(`/quizzes/${quizId}/eligibility`),
  startAttempt: (quizId) => api.post(`/quizzes/${quizId}/attempt/start`),
  getAttemptState: (attemptId) => api.get(`/attempts/${attemptId}`),
  saveAnswer: (attemptId, attemptQuestionId, data) =>
    api.put(`/attempts/${attemptId}/answers/${attemptQuestionId}`, data),
  submitAttempt: (attemptId) => api.post(`/attempts/${attemptId}/submit`),
  trackEvent: (attemptId, data) => api.post(`/attempts/${attemptId}/events`, data),

  // Teacher Review & Grading
  getPendingReview: (quizId) => api.get(`/quizzes/${quizId}/review`),
  submitReview: (questionScoreId, data) => api.post(`/review/${questionScoreId}`, data),
  finalizeResult: (resultId) => api.post(`/results/${resultId}/finalize`),

  // Results & Feedback
  getQuizResultsList: (quizId) => api.get(`/quizzes/${quizId}/results`),
  releaseResults: (quizId) => api.post(`/quizzes/${quizId}/results/release`),
  getStudentResult: (attemptId) => api.get(`/attempts/${attemptId}/result`),
  getTeacherAttemptResult: (attemptId) => api.get(`/teacher/attempts/${attemptId}/result`),
  getExplanation: (scoreId) => api.get(`/results/${scoreId}/explanation`),

  // Analytics & Exports
  getQuizAnalytics: (quizId) => api.get(`/quizzes/${quizId}/analytics`),
  getQuestionAnalytics: (quizId) => api.get(`/quizzes/${quizId}/analytics/questions`),
  exportResultsCSV: (quizId) => api.get(`/quizzes/${quizId}/export/results.csv`),

  // Access Grants
  getGrants: (quizId) => api.get(`/quizzes/${quizId}/grants`),
  createGrant: (quizId, data) => api.post(`/quizzes/${quizId}/grants`, data),
  revokeGrant: (quizId, grantId) => api.delete(`/quizzes/${quizId}/grants/${grantId}`),
};

export default quizService;
