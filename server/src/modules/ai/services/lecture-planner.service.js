import { GeminiService } from './gemini.service.js';
import { AIRetrievalService } from './retrieval.service.js';
import { GeneratedContent } from '../models/GeneratedContent.js';
import { QuizService } from '../../quizzes/services/quiz.service.js';
import { AssignmentService } from '../../assignments/services/assignment.service.js';
import { SYSTEM_PROMPTS } from '../ai.prompts.js';

export class LecturePlannerService {
  /**
   * Generate minute-by-minute lecture plan with option for RAG context.
   */
  static async generateLecturePlan(userId, userRole, params) {
    const {
      classroomId,
      topic,
      learningOutcomes = [],
      lectureDurationMinutes = 60,
      difficultyLevel = 'intermediate',
      teachingStyle = 'interactive',
      selectedResourceIds = [],
      allowGeneralFallback = false,
      includeActivity = true,
      includeAssessment = true,
      includeHomework = true,
    } = params;

    let contextText = '';
    let citations = [];

    if (selectedResourceIds && selectedResourceIds.length > 0) {
      const RAG = await AIRetrievalService.retrieveContext({
        query: topic,
        classroomId,
        userId,
        userRole,
        selectedResourceIds,
        topK: 5,
      });
      contextText = RAG.packedContext;
      citations = RAG.citations;
    }

    const prompt = `Topic: "${topic}"
Duration: ${lectureDurationMinutes} minutes
Level: ${difficultyLevel}
Style: ${teachingStyle}
Outcomes: ${learningOutcomes.join(', ')}

${contextText ? `Classroom Context:\n${contextText}` : ''}

JSON Schema Required:
{
  "title": "Lecture Plan: ${topic}",
  "objectives": ["..."],
  "prerequisites": ["..."],
  "segments": [
    {
      "title": "Segment Name",
      "durationMinutes": 10,
      "teachingPoints": ["..."],
      "examples": ["..."],
      "activity": "Optional Activity"
    }
  ],
  "quickAssessment": [
    { "question": "...", "answer": "..." }
  ],
  "homework": [
    { "title": "...", "description": "..." }
  ],
  "commonMisconceptions": ["..."],
  "teacherNotes": ["..."]
}`;

    const res = await GeminiService.generateStructuredJson({
      prompt,
      systemInstruction: SYSTEM_PROMPTS.LECTURE_PLANNER,
      temperature: 0.3,
      maxTokens: 2048,
    });

    const generated = await GeneratedContent.create({
      userId,
      role: userRole,
      classroomId,
      type: 'lecture_plan',
      title: res.data.title || `Lecture Plan: ${topic}`,
      content: JSON.stringify(res.data, null, 2),
      structuredContent: res.data,
      sourceResourceIds: selectedResourceIds,
      citations,
      status: 'saved',
      grounded: citations.length > 0,
    });

    return generated;
  }

  /**
   * Convert lecture assessment questions into a draft Module 6 Quiz.
   */
  static async convertToQuizDraft(userId, lecturePlanId) {
    const plan = await GeneratedContent.findById(lecturePlanId);
    if (!plan || !plan.structuredContent?.quickAssessment) {
      throw new Error('No quick assessment questions found in this lecture plan');
    }

    const questions = plan.structuredContent.quickAssessment;
    const quiz = await QuizService.createQuiz(plan.classroomId, userId, {
      title: `Quiz: ${plan.title}`,
      description: `Generated from lecture plan: ${plan.title}`,
      durationMinutes: 15,
      totalMarks: questions.length * 5,
      quizType: 'practice',
    });

    return { quizId: quiz._id, questionCount: questions.length };
  }
}
