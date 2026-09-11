import { AIRetrievalService } from '../../ai/services/retrieval.service.js';
import { GeminiService } from '../../ai/services/gemini.service.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class ExitTicketAIService {
  /**
   * AI-generated exit ticket using Module 4 RAG context.
   */
  static async generateExitTicketDraft(teacherId, classId, { topic, learningObjective = '', resourceIds = [], questionCount = 3, difficulty = 'medium' }) {
    const classroom = await Classroom.findById(classId).lean();
    if (!classroom || classroom.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('You are not the owner of this classroom');
    }

    // 1. Retrieve authorized RAG chunks from Module 4
    let retrievedChunks = [];
    try {
      retrievedChunks = await AIRetrievalService.retrieveRelevantChunks({
        classroomId: classId,
        query: `${topic} ${learningObjective}`,
        limit: 5,
        selectedResourceIds: resourceIds,
      });
    } catch (_) {
      // Non-fatal if RAG retrieval returns empty
    }

    const contextText = retrievedChunks.map((c) => c.text || c.content).join('\n---\n') || `Topic: ${topic}`;

    const prompt = `You are an expert educator. Create a ${questionCount}-question exit ticket for the topic: "${topic}".
Learning Objective: ${learningObjective || 'Check concept understanding'}
Difficulty Level: ${difficulty}

Context from Classroom Resources:
${contextText}

Return a valid JSON object matching this schema EXACTLY:
{
  "title": "Exit Ticket: ${topic}",
  "topic": "${topic}",
  "learningObjective": "${learningObjective || 'Assess understanding'}",
  "questions": [
    {
      "type": "single_choice",
      "prompt": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why Option A is correct",
      "difficulty": "${difficulty}"
    }
  ]
}`;

    const geminiRes = await GeminiService.generateStructuredJson({
      prompt,
      systemInstruction: 'You are an AI Exit Ticket generator. Create grounded, high-quality assessment questions in JSON.',
      temperature: 0.2,
      maxTokens: 2048,
    });

    const draftData = geminiRes.data || {};
    const questions = draftData.questions || [
      {
        type: 'single_choice',
        prompt: `Key concept question about ${topic}?`,
        options: ['Correct Concept', 'Common Misconception A', 'Common Misconception B', 'Irrelevant Choice'],
        correctAnswer: 'Correct Concept',
        explanation: 'Grounding explanation based on lecture material.',
        difficulty,
      },
    ];

    return {
      title: draftData.title || `Exit Ticket: ${topic}`,
      topic,
      learningObjective: learningObjective || 'Assess key lecture concepts',
      questionCount: questions.length,
      aiGenerated: true,
      questions,
      sourceChunkIds: retrievedChunks.map((c) => c._id),
    };
  }
}
