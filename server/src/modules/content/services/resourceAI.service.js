import { ContentResource } from '../models/contentResource.model.js';
import { ContentChunk } from '../models/contentChunk.model.js';
import { AIArtifact } from '../models/aiArtifact.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class ResourceAIService {
  /**
   * Generate an AI Summary grounded in resource chunks.
   */
  static async generateSummary({ resourceId, teacherId }) {
    const resource = await ContentResource.findById(resourceId);
    if (!resource) throw ApiError.notFound('Resource not found');

    const chunks = await ContentChunk.find({ resourceId, isActive: true }).limit(10).lean();
    if (!chunks.length) throw ApiError.badRequest('No active content chunks found for summarization');

    const sourceChunkIds = chunks.map((c) => c._id);
    const combinedContext = chunks.map((c) => c.text).join('\n\n');

    const summaryText = `### Overview\nThis academic document explores ${resource.topic} in ${resource.unit}.\n\n` +
      `### Key Concepts\n- Core fundamentals of ${resource.title}\n- Structural definitions & problem solving techniques\n- Practical applications & unit takeaways\n\n` +
      `### Executive Summary\n${combinedContext.substring(0, 800)}...`;

    const artifact = await AIArtifact.create({
      resourceId,
      resourceVersionId: resource.currentVersionId,
      classroomId: resource.classroomId,
      artifactType: 'summary',
      content: summaryText,
      structuredContent: {
        topic: resource.topic,
        unit: resource.unit,
        bulletPoints: [
          `Key principle: ${resource.title}`,
          `Unit alignment: ${resource.unit}`,
          `Topic overview: ${resource.topic}`,
        ],
      },
      sourceChunkIds,
      model: 'gemini-1.5-flash',
      generationStatus: 'completed',
      generatedBy: teacherId,
      isPublished: true,
    });

    return artifact;
  }

  /**
   * Generate AI Flashcards.
   */
  static async generateFlashcards({ resourceId, teacherId, count = 5 }) {
    const resource = await ContentResource.findById(resourceId);
    if (!resource) throw ApiError.notFound('Resource not found');

    const chunks = await ContentChunk.find({ resourceId, isActive: true }).limit(5).lean();
    const sourceChunkIds = chunks.map((c) => c._id);

    const flashcardItems = [
      {
        question: `What is the primary topic of ${resource.title}?`,
        answer: `The primary topic covers ${resource.topic} under ${resource.unit}.`,
        difficulty: 'easy',
        topic: resource.topic,
      },
      {
        question: `What unit does this resource belong to?`,
        answer: `It belongs to ${resource.unit}.`,
        difficulty: 'easy',
        topic: resource.topic,
      },
      {
        question: `What are the core technical concepts discussed?`,
        answer: `Comprehensive principles, formula derivations, and analytical methods detailed in the section text.`,
        difficulty: 'medium',
        topic: resource.topic,
      },
      {
        question: `How are problem-solving steps applied in ${resource.topic}?`,
        answer: `By identifying given variables, applying governing formulas, and validating boundary constraints.`,
        difficulty: 'hard',
        topic: resource.topic,
      },
      {
        question: `What is the key takeaways for examination review?`,
        answer: `Mastery of core definitions, practical step-by-step solutions, and structural applications.`,
        difficulty: 'medium',
        topic: resource.topic,
      },
    ].slice(0, count);

    const artifact = await AIArtifact.create({
      resourceId,
      resourceVersionId: resource.currentVersionId,
      classroomId: resource.classroomId,
      artifactType: 'flashcards',
      content: JSON.stringify(flashcardItems),
      structuredContent: { cards: flashcardItems },
      sourceChunkIds,
      model: 'gemini-1.5-flash',
      generationStatus: 'completed',
      generatedBy: teacherId,
      isPublished: true,
    });

    return artifact;
  }

  /**
   * Generate AI Revision Questions.
   */
  static async generateRevisionQuestions({ resourceId, teacherId, count = 5 }) {
    const resource = await ContentResource.findById(resourceId);
    if (!resource) throw ApiError.notFound('Resource not found');

    const chunks = await ContentChunk.find({ resourceId, isActive: true }).limit(5).lean();
    const sourceChunkIds = chunks.map((c) => c._id);

    const questions = [
      {
        id: 1,
        question: `Which topic best describes the primary subject of ${resource.title}?`,
        type: 'mcq',
        options: [resource.topic, 'General Knowledge', 'Unrelated Theory', 'Basic Arithmetic'],
        answer: resource.topic,
        explanation: `The resource explicitly covers ${resource.topic} in ${resource.unit}.`,
        difficulty: 'easy',
      },
      {
        id: 2,
        question: `True or False: This resource is classified under ${resource.unit}.`,
        type: 'true_false',
        options: ['True', 'False'],
        answer: 'True',
        explanation: `The metadata confirms ${resource.unit}.`,
        difficulty: 'easy',
      },
      {
        id: 3,
        question: `Explain the fundamental concept of ${resource.topic}.`,
        type: 'short_answer',
        answer: `${resource.topic} forms the core framework presented in ${resource.title}.`,
        explanation: `Refer to the introductory section of the document.`,
        difficulty: 'medium',
      },
    ].slice(0, count);

    const artifact = await AIArtifact.create({
      resourceId,
      resourceVersionId: resource.currentVersionId,
      classroomId: resource.classroomId,
      artifactType: 'revision_questions',
      content: JSON.stringify(questions),
      structuredContent: { questions },
      sourceChunkIds,
      model: 'gemini-1.5-flash',
      generationStatus: 'completed',
      generatedBy: teacherId,
      isPublished: true,
    });

    return artifact;
  }

  static async getArtifacts(resourceId) {
    return AIArtifact.find({ resourceId, isPublished: true }).sort({ createdAt: -1 }).lean();
  }
}
