import { ExitTicketService } from '../services/exitTicket.service.js';
import { ExitTicketAIService } from '../services/exitTicketAI.service.js';
import { ApiResponse } from '../../../utils/api-response.js';
import { ExitTicket } from '../models/exitTicket.model.js';

export async function createExitTicket(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { classId } = req.params;

    const result = await ExitTicketService.createExitTicket(teacherId, classId, req.body);
    return ApiResponse.created(res, result, 'Exit ticket created successfully');
  } catch (error) {
    next(error);
  }
}

export async function generateAIExitTicket(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { classId } = req.params;

    const draft = await ExitTicketAIService.generateExitTicketDraft(teacherId, classId, req.body);
    return ApiResponse.success(res, 200, 'AI exit ticket draft generated successfully', { draft });
  } catch (error) {
    next(error);
  }
}

export async function getClassroomExitTickets(req, res, next) {
  try {
    const { classId } = req.params;
    const tickets = await ExitTicket.find({ classroomId: classId }).sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, 200, 'Exit tickets fetched', { tickets });
  } catch (error) {
    next(error);
  }
}

export async function getExitTicketById(req, res, next) {
  try {
    const { ticketId } = req.params;
    const requesterRole = req.user.role;

    const results = await ExitTicketService.getExitTicketResults(ticketId, requesterRole);
    return ApiResponse.success(res, 200, 'Exit ticket fetched', results);
  } catch (error) {
    next(error);
  }
}

export async function startExitTicket(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { ticketId } = req.params;

    const result = await ExitTicketService.startExitTicket(teacherId, ticketId);
    return ApiResponse.success(res, 200, 'Exit ticket launched', result);
  } catch (error) {
    next(error);
  }
}

export async function submitExitTicketAttempt(req, res, next) {
  try {
    const studentId = req.user._id;
    const { ticketId } = req.params;

    const result = await ExitTicketService.submitAttempt(studentId, ticketId, req.body);
    return ApiResponse.success(res, 200, 'Exit ticket submitted successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function closeExitTicket(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { ticketId } = req.params;

    const result = await ExitTicketService.closeExitTicket(teacherId, ticketId);
    return ApiResponse.success(res, 200, 'Exit ticket closed', result);
  } catch (error) {
    next(error);
  }
}
