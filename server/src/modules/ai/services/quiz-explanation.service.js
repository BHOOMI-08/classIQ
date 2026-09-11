import { GeminiService } from './gemini.service.js';
import { QuestionScore } from '../../quizzes/models/questionScore.model.js';
import { QuizAttempt } from '../../quizzes/models/quizAttempt.model.js';
import { Quiz } from '../../quizzes/models/quiz.model.js';
import { AIRetrievalService } from './retrieval.service.js';
import { ApiError } from '../../../utils/api-error.js';
import { SYSTEM_PROMPTS } from '../ai.prompts.js';

export class QuizExplanationService {
  /**
   * Generates grounded AI explanations respecting Module 6 result release policy.
   */
  static async generateQuizExplanation(userId, userRole, { scoreId, attemptId, quizId }) {
    // 1. Verify Attempt & Quiz Release Policy
    const attempt = await QuizAttempt.findById(attemptId).lean();
    if (!attempt) throw ApiError.notFound('Attempt not found');
    if (attempt.studentId.toString() !== userId.toString() && userRole !== 'teacher') {
      throw ApiError.forbidden('Not your quiz attempt');
    }

    const quiz = await Quiz.findById(quizId || attempt.quizId).lean();
    if (!quiz) throw ApiError.notFound('Quiz not found');

    // Check result release policy
    if (quiz.resultReleaseMode === 'after_closing' && new Date() < new Date(quiz.closingAt)) {
      throw ApiError.forbidden('Quiz answers and explanations will be released after the closing date');
    }

    // 2. Fetch Score Record
    const score = await QuestionScore.findById(scoreId).lean();
    if (!score) throw ApiError.notFound('Question score record not found');

    // 3. Optional RAG context fetch
    const RAG = await AIRetrievalService.retrieveContext({
      query: score.prompt || score.topic || 'Quiz question context',
      classroomId: quiz.classroomId,
      userId,
      userRole,
      topK: 3,
    });

    const prompt = `Question Prompt: "${score.prompt || 'Question'}"
Student Answer: "${score.userAnswer || 'No answer'}"
Correct Answer: "${score.correctAnswer || 'Answer'}"
Topic: "${score.topic || 'General'}"
${RAG.packedContext ? `Reference Notes:\n${RAG.packedContext}` : ''}

JSON Schema Output Required:
{
  "whyCorrect": "Explanation of the correct answer and reasoning",
  "studentMistake": "Explanation of student's mistake (if incorrect)",
  "conceptSummary": "Key concept summary to remember",
  "similarPracticeQuestion": "A similar question for student practice"
}`;

    const res = await GeminiService.generateStructuredJson({
      prompt,
      systemInstruction: SYSTEM_PROMPTS.QUIZ_EXPLANATION,
      temperature: 0.3,
      maxTokens: 1024,
    });

    return {
      explanation: res.data.whyCorrect || res.rawText,
      structuredExplanation: res.data,
      citations: RAG.citations,
      grounded: RAG.citations.length > 0,
    };
  }
}
