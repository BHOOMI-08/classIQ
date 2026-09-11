import { GeminiService } from './gemini.service.js';
import { AIRetrievalService } from './retrieval.service.js';
import { GeneratedContent } from '../models/GeneratedContent.js';
import { AIPromptBuilderService } from './prompt-builder.service.js';
import { ApiError } from '../../../utils/api-error.js';

export class RevisionService {
  /**
   * Generate Smart Revision Asset using Module 4 RAG pipeline strictly grounded in uploaded resources.
   */
  static async generateRevisionAsset(userId, userRole, { classroomId, resourceId = null, topic = 'General Topic', revisionType = 'revision_pack' }) {
    if (!classroomId) {
      throw ApiError.badRequest('classroomId is required');
    }

    // 1. Retrieve RAG context chunks from teacher-uploaded resources
    const resourceFilter = resourceId ? [resourceId] : [];
    const RAG = await AIRetrievalService.retrieveContext({
      query: `Core concepts, definitions, formulas, and revision materials for ${topic}`,
      classroomId,
      userId,
      userRole,
      selectedResourceIds: resourceFilter,
      topK: 6,
      minScore: 0.15,
    });

    const contextText = RAG.packedContext;
    const citations = RAG.citations;

    if (!contextText || citations.length === 0) {
      throw ApiError.badRequest('No published classroom resources found for this classroom/topic to generate revision assets.');
    }

    // 2. Build prompt with strict RAG context
    const prompt = AIPromptBuilderService.buildRevisionPrompt({
      topic,
      revisionType,
      packedContext: contextText,
    });

    const systemInstruction = 'You are the ClassIQ Smart Revision Generator. You ONLY use the provided context to generate flashcards, summaries, questions, formula sheets, checklists, and mini quizzes. Never hallucinate facts.';

    const geminiRes = await GeminiService.generateStructuredJson({
      prompt,
      systemInstruction,
      temperature: 0.2,
      maxTokens: 2048,
    });

    // 3. Save generated asset to GeneratedContent database collection
    const generatedAsset = await GeneratedContent.create({
      userId,
      role: userRole,
      classroomId,
      type: 'revision_pack',
      title: geminiRes.data.title || `${topic} - Smart Revision Pack`,
      content: geminiRes.data.summary || geminiRes.rawText,
      structuredContent: geminiRes.data,
      sourceResourceIds: resourceFilter,
      citations,
      status: 'saved',
      grounded: true,
    });

    return generatedAsset;
  }

  /**
   * Get student's generated revision assets.
   */
  static async getRevisions(userId, classroomId = null) {
    const filter = { userId, type: 'revision_pack' };
    if (classroomId) {
      filter.classroomId = classroomId;
    }

    const assets = await GeneratedContent.find(filter)
      .populate('classroomId', 'name subjectCode')
      .sort({ createdAt: -1 })
      .lean();

    return assets;
  }

  /**
   * Get specific generated revision asset by ID.
   */
  static async getRevisionById(userId, revisionId) {
    const asset = await GeneratedContent.findOne({ _id: revisionId, userId })
      .populate('classroomId', 'name subjectCode')
      .populate('sourceResourceIds', 'title topic unit')
      .lean();

    if (!asset) {
      throw ApiError.notFound('Revision asset not found');
    }

    return asset;
  }
}
