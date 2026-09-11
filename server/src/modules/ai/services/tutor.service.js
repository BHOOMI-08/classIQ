import { AIConversation } from '../models/AIConversation.js';
import { AIMessage } from '../models/AIMessage.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { AIRetrievalService } from './retrieval.service.js';
import { GeminiService } from './gemini.service.js';
import { AIPromptBuilderService } from './prompt-builder.service.js';
import { AICitationService } from './citation.service.js';
import { ApiError } from '../../../utils/api-error.js';

export class AITutorService {
  /**
   * Process student question and generate grounded response.
   */
  static async chat(userId, userRole, { message, classroomId, conversationId = null }) {
    if (!message || !message.trim()) {
      throw ApiError.badRequest('Question message is required');
    }
    if (!classroomId) {
      throw ApiError.badRequest('classroomId is required');
    }

    // 1. Verify Classroom Enrollment Authorization
    const isEnrolled = await Enrollment.findOne({
      classroomId,
      studentId: userId,
      status: 'active',
    });

    if (!isEnrolled && userRole === 'student') {
      throw ApiError.forbidden('You are not enrolled in this classroom');
    }

    // 2. Resolve or create AIConversation
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        throw ApiError.notFound('Conversation not found');
      }
    } else {
      conversation = await AIConversation.create({
        userId,
        classroomId,
        title: message.trim().slice(0, 40) + '...',
      });
    }

    // 3. Retrieve prior messages for chat history
    const priorMessages = await AIMessage.find({ conversationId: conversation._id })
      .sort({ sequence: 1 })
      .lean();

    const sequenceNumber = priorMessages.length + 1;

    // 4. Save User Message
    const userMessage = await AIMessage.create({
      conversationId: conversation._id,
      role: 'user',
      content: message.trim(),
      sequence: sequenceNumber,
    });

    // 5. RAG Retrieval Step over teacher-uploaded resources
    const RAG = await AIRetrievalService.retrieveContext({
      query: message.trim(),
      classroomId,
      userId,
      userRole,
      topK: 5,
      minScore: 0.15,
    });

    const fallbackMessage = 'The uploaded classroom resources do not contain enough information to answer this confidently.';

    let responseContent = '';
    let citations = [];
    let grounded = true;
    let confidence = 'high';
    let promptTokens = 0;
    let responseTokens = 0;

    if (!RAG.packedContext || RAG.chunks.length === 0) {
      // Fallback response when no context matches query
      responseContent = fallbackMessage;
      grounded = false;
      confidence = 'unsupported';
      citations = [];
    } else {
      // Build Prompt & call Gemini API
      const systemInstruction = AIPromptBuilderService.buildTutorSystemInstruction();
      const promptText = AIPromptBuilderService.buildTutorPrompt({
        question: message.trim(),
        packedContext: RAG.packedContext,
        history: priorMessages,
      });

      const geminiRes = await GeminiService.generateContent({
        prompt: promptText,
        systemInstruction,
        temperature: 0.2,
        maxTokens: 1200,
      });

      responseContent = geminiRes.text;
      promptTokens = geminiRes.promptTokens || 0;
      responseTokens = geminiRes.responseTokens || 0;

      // Filter and validate citations against retrieved metadata
      citations = AICitationService.filterValidCitations([], RAG.citations);
      if (responseContent.includes(fallbackMessage)) {
        grounded = false;
        confidence = 'unsupported';
      }
    }

    // 6. Save Assistant Message
    const assistantMessage = await AIMessage.create({
      conversationId: conversation._id,
      role: 'assistant',
      content: responseContent,
      citations,
      grounded,
      confidence,
      promptTokens,
      responseTokens,
      sequence: sequenceNumber + 1,
    });

    // Update conversation metrics
    conversation.messageCount += 2;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return {
      conversation,
      userMessage,
      assistantMessage,
      citations,
      grounded,
      confidence,
    };
  }

  /**
   * Get user's tutor conversation history.
   */
  static async getHistory(userId, classroomId = null) {
    const filter = { userId, status: 'active' };
    if (classroomId) {
      filter.classroomId = classroomId;
    }

    const conversations = await AIConversation.find(filter)
      .populate('classroomId', 'name subjectCode')
      .sort({ updatedAt: -1 })
      .lean();

    return conversations;
  }

  /**
   * Get messages for specific conversation ID.
   */
  static async getConversationMessages(userId, conversationId) {
    const conversation = await AIConversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    const messages = await AIMessage.find({ conversationId })
      .sort({ sequence: 1 })
      .lean();

    return { conversation, messages };
  }

  /**
   * Delete conversation history by ID.
   */
  static async deleteHistory(userId, conversationId) {
    const conversation = await AIConversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    await AIMessage.deleteMany({ conversationId });
    await AIConversation.deleteOne({ _id: conversationId });

    return { success: true, message: 'Conversation deleted successfully' };
  }
}
