import { ApiResponse } from '../../utils/api-response.js';
import { GeminiService } from './services/gemini.service.js';
import { AIRetrievalService } from './services/retrieval.service.js';
import { AICitationService } from './services/citation.service.js';
import { AISafetyService } from './services/ai-safety.service.js';
import { AIUsageService } from './services/ai-usage.service.js';
import { StudyPlannerService } from './services/study-planner.service.js';
import { WeaknessEngineService } from './services/weakness-engine.service.js';
import { RevisionService } from './services/revision.service.js';
import { LecturePlannerService } from './services/lecture-planner.service.js';
import { ClassSummaryService } from './services/class-summary.service.js';
import { AnnouncementWriterService } from './services/announcement-writer.service.js';
import { QuizExplanationService } from './services/quiz-explanation.service.js';
import { AIConversation } from './models/AIConversation.js';
import { AIMessage } from './models/AIMessage.js';
import { GeneratedContent } from './models/GeneratedContent.js';
import { StudyPlan } from './models/StudyPlan.js';
import { StudyTask } from './models/StudyTask.js';
import { SYSTEM_PROMPTS } from './ai.prompts.js';
import { INSUFFICIENT_CONTEXT_MESSAGE, AI_FEATURES } from './ai.constants.js';

// --- STUDENT AI TUTOR CONTROLLERS ---

export const createTutorConversation = async (req, res, next) => {
  try {
    const { classroomId, title } = req.body;
    const conversation = await AIConversation.create({
      userId: req.user._id,
      classroomId,
      title: title || 'New AI Tutor Chat',
    });
    ApiResponse.created(res, { conversation }, 'Conversation created');
  } catch (err) { next(err); }
};

export const getTutorConversations = async (req, res, next) => {
  try {
    const { classroomId } = req.query;
    const filter = { userId: req.user._id, status: 'active' };
    if (classroomId) filter.classroomId = classroomId;

    const conversations = await AIConversation.find(filter).sort({ updatedAt: -1 }).lean();
    ApiResponse.success(res, 200, 'Conversations fetched', { conversations });
  } catch (err) { next(err); }
};

export const getTutorMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await AIMessage.find({ conversationId }).sort({ sequence: 1 }).lean();
    ApiResponse.success(res, 200, 'Messages fetched', { messages });
  } catch (err) { next(err); }
};

export const sendTutorMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { message, selectedResourceIds = [] } = req.body;

    // 1. Quota & Safety check
    await AIUsageService.checkDailyUserQuota(req.user._id);
    const cleanMessage = AISafetyService.validateInputSafety(message);

    const conversation = await AIConversation.findById(conversationId);
    if (!conversation) return next(new Error('Conversation not found'));

    // Save User Message
    const msgCount = await AIMessage.countDocuments({ conversationId });
    await AIMessage.create({
      conversationId,
      role: 'user',
      content: cleanMessage,
      sequence: msgCount + 1,
    });

    // 2. RAG Retrieval
    const RAG = await AIRetrievalService.retrieveContext({
      query: cleanMessage,
      classroomId: conversation.classroomId,
      userId: req.user._id,
      userRole: req.user.role,
      selectedResourceIds,
      topK: 5,
    });

    let assistantText = '';
    let citations = [];
    let grounded = true;
    let confidence = 'high';

    if (!RAG.packedContext) {
      assistantText = INSUFFICIENT_CONTEXT_MESSAGE;
      grounded = false;
      confidence = 'unsupported';
    } else {
      const prompt = `Retrieved Classroom Reference Material:\n${RAG.packedContext}\n\nUser Question: "${cleanMessage}"`;
      const geminiRes = await GeminiService.generateContent({
        prompt,
        systemInstruction: SYSTEM_PROMPTS.STRICT_TUTOR,
        temperature: 0.2,
        maxTokens: 1024,
      });

      assistantText = geminiRes.text || INSUFFICIENT_CONTEXT_MESSAGE;
      citations = AICitationService.filterValidCitations([], RAG.citations);
    }

    // Save Assistant Response
    const assistantMsg = await AIMessage.create({
      conversationId,
      role: 'assistant',
      content: assistantText,
      citations,
      grounded,
      confidence,
      sequence: msgCount + 2,
    });

    // Update conversation lastMessageAt & messageCount
    conversation.lastMessageAt = new Date();
    conversation.messageCount = msgCount + 2;
    await conversation.save();

    await AIUsageService.logUsage({
      userId: req.user._id,
      userRole: req.user.role,
      classroomId: conversation.classroomId,
      feature: AI_FEATURES.TUTOR,
      grounded,
      citationCount: citations.length,
    });

    ApiResponse.created(res, { message: assistantMsg }, 'Tutor response generated');
  } catch (err) { next(err); }
};

export const submitTutorFeedback = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { rating, comment } = req.body;

    const message = await AIMessage.findById(messageId);
    if (!message) return next(new Error('Message not found'));

    message.feedback = { rating, comment: comment || '' };
    await message.save();

    ApiResponse.success(res, 200, 'Feedback recorded', { message });
  } catch (err) { next(err); }
};

// --- TEACHER AI CONTROLLERS ---

export const generateLecturePlan = async (req, res, next) => {
  try {
    await AIUsageService.checkDailyUserQuota(req.user._id);
    const result = await LecturePlannerService.generateLecturePlan(req.user._id, req.user.role, req.body);

    await AIUsageService.logUsage({
      userId: req.user._id,
      userRole: req.user.role,
      classroomId: req.body.classroomId,
      feature: AI_FEATURES.LECTURE_PLANNER,
      grounded: result.grounded,
      citationCount: result.citations.length,
    });

    ApiResponse.created(res, { lecturePlan: result }, 'Lecture plan generated');
  } catch (err) { next(err); }
};

export const getLecturePlans = async (req, res, next) => {
  try {
    const { classroomId } = req.query;
    const filter = { userId: req.user._id, type: 'lecture_plan' };
    if (classroomId) filter.classroomId = classroomId;

    const plans = await GeneratedContent.find(filter).sort({ createdAt: -1 }).lean();
    ApiResponse.success(res, 200, 'Lecture plans fetched', { plans });
  } catch (err) { next(err); }
};

export const convertLecturePlanToQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await LecturePlannerService.convertToQuizDraft(req.user._id, id);
    ApiResponse.created(res, result, 'Quiz draft created from lecture plan');
  } catch (err) { next(err); }
};

export const generateAnnouncement = async (req, res, next) => {
  try {
    await AIUsageService.checkDailyUserQuota(req.user._id);
    const result = await AnnouncementWriterService.generateAnnouncement(req.user._id, req.user.role, req.body);

    await AIUsageService.logUsage({
      userId: req.user._id,
      userRole: req.user.role,
      classroomId: req.body.classroomId,
      feature: AI_FEATURES.ANNOUNCEMENT_WRITER,
    });

    ApiResponse.created(res, { announcement: result }, 'Announcement draft generated');
  } catch (err) { next(err); }
};

export const generateClassSummary = async (req, res, next) => {
  try {
    await AIUsageService.checkDailyUserQuota(req.user._id);
    const { classroomId } = req.body;
    const result = await ClassSummaryService.generateClassSummary(req.user._id, req.user.role, classroomId);

    await AIUsageService.logUsage({
      userId: req.user._id,
      userRole: req.user.role,
      classroomId,
      feature: AI_FEATURES.CLASS_SUMMARY,
    });

    ApiResponse.created(res, { summary: result }, 'Class summary generated');
  } catch (err) { next(err); }
};

// --- STUDY PLANNER & WEAKNESS CONTROLLERS ---

export const generateStudyPlan = async (req, res, next) => {
  try {
    await AIUsageService.checkDailyUserQuota(req.user._id);
    const result = await StudyPlannerService.generateStudyPlan(req.user._id, req.body);

    await AIUsageService.logUsage({
      userId: req.user._id,
      userRole: req.user.role,
      feature: AI_FEATURES.STUDY_PLANNER,
    });

    ApiResponse.created(res, result, 'Study plan generated');
  } catch (err) { next(err); }
};

export const getStudyPlan = async (req, res, next) => {
  try {
    const studyPlan = await StudyPlan.findOne({ studentId: req.user._id, status: 'active' }).lean();
    if (!studyPlan) return ApiResponse.success(res, 200, 'No active study plan', { studyPlan: null, tasks: [] });

    const tasks = await StudyTask.find({ studyPlanId: studyPlan._id }).sort({ scheduledDate: 1, priorityScore: -1 }).lean();
    ApiResponse.success(res, 200, 'Study plan fetched', { studyPlan, tasks });
  } catch (err) { next(err); }
};

export const updateStudyTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, skipReason } = req.body;

    const task = await StudyTask.findById(taskId);
    if (!task) return next(new Error('Study task not found'));

    if (status) task.status = status;
    if (status === 'completed') task.completedAt = new Date();
    if (skipReason) task.skipReason = skipReason;

    await task.save();
    ApiResponse.success(res, 200, 'Study task updated', { task });
  } catch (err) { next(err); }
};

export const recalculateStudyPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await StudyPlannerService.recalculateSchedule(req.user._id, id);
    ApiResponse.success(res, 200, 'Study schedule recalculated', result);
  } catch (err) { next(err); }
};

export const getWeaknessMap = async (req, res, next) => {
  try {
    const { classroomId } = req.query;
    const profile = await WeaknessEngineService.computeWeaknessMap(req.user._id, classroomId || req.user.classroomId);
    ApiResponse.success(res, 200, 'Weakness profile computed', { profile });
  } catch (err) { next(err); }
};

// --- REVISION & QUIZ EXPLANATION CONTROLLERS ---

export const generateRevisionAsset = async (req, res, next) => {
  try {
    await AIUsageService.checkDailyUserQuota(req.user._id);
    const result = await RevisionService.generateRevisionAsset(req.user._id, req.user.role, req.body);

    await AIUsageService.logUsage({
      userId: req.user._id,
      userRole: req.user.role,
      classroomId: req.body.classroomId,
      feature: AI_FEATURES.REVISION_GENERATOR,
      grounded: result.grounded,
      citationCount: result.citations.length,
    });

    ApiResponse.created(res, { revision: result }, 'Revision material generated');
  } catch (err) { next(err); }
};

export const generateQuizExplanation = async (req, res, next) => {
  try {
    await AIUsageService.checkDailyUserQuota(req.user._id);
    const result = await QuizExplanationService.generateQuizExplanation(req.user._id, req.user.role, req.body);

    await AIUsageService.logUsage({
      userId: req.user._id,
      userRole: req.user.role,
      feature: AI_FEATURES.QUIZ_EXPLANATION,
      grounded: result.grounded,
      citationCount: result.citations.length,
    });

    ApiResponse.success(res, 200, 'Quiz explanation generated', result);
  } catch (err) { next(err); }
};
