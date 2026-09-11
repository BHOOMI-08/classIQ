import { AITutorService } from '../services/tutor.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export async function chatTutor(req, res, next) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { message, classroomId, conversationId } = req.body;

    const result = await AITutorService.chat(userId, userRole, { message, classroomId, conversationId });

    return ApiResponse.success(res, 200, 'AI Tutor response generated successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function getTutorHistory(req, res, next) {
  try {
    const userId = req.user._id;
    const { classroomId } = req.query;

    const conversations = await AITutorService.getHistory(userId, classroomId);

    return ApiResponse.success(res, 200, 'Tutor history retrieved successfully', { conversations });
  } catch (error) {
    next(error);
  }
}

export async function getTutorMessages(req, res, next) {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const result = await AITutorService.getConversationMessages(userId, conversationId);

    return ApiResponse.success(res, 200, 'Tutor messages retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function deleteTutorHistory(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const result = await AITutorService.deleteHistory(userId, id);

    return ApiResponse.success(res, 200, 'Conversation deleted successfully', result);
  } catch (error) {
    next(error);
  }
}
