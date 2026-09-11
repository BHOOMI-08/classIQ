import { ExitTicket } from '../models/exitTicket.model.js';
import { ExitTicketQuestion } from '../models/exitTicketQuestion.model.js';
import { ExitTicketAttempt } from '../models/exitTicketAttempt.model.js';
import { ExitTicketAnswer } from '../models/exitTicketAnswer.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { EXIT_TICKET_STATUS, EXIT_TICKET_ATTEMPT_STATUS } from '../utils/engagement.constants.js';
import { ExitTicketGradingService } from './exitTicketGrading.service.js';
import { EngagementActivityService } from './engagementActivity.service.js';
import { getIO } from '../../../socket/socket.server.js';
import { ApiError } from '../../../utils/api-error.js';

export class ExitTicketService {
  /**
   * Create an exit ticket with questions.
   */
  static async createExitTicket(teacherId, classId, payload) {
    const classroom = await Classroom.findById(classId).lean();
    if (!classroom || classroom.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('You are not the owner of this classroom');
    }

    const ticket = await ExitTicket.create({
      classroomId: classId,
      teacherId,
      title: payload.title,
      topic: payload.topic || 'Lecture Exit Ticket',
      learningObjective: payload.learningObjective || '',
      status: EXIT_TICKET_STATUS.DRAFT,
      durationMinutes: payload.durationMinutes || 5,
      questionCount: (payload.questions || []).length,
      showResultsToStudents: payload.showResultsToStudents !== false,
      allowRetry: Boolean(payload.allowRetry),
    });

    const questionDocs = (payload.questions || []).map((q, idx) => ({
      exitTicketId: ticket._id,
      type: q.type || 'single_choice',
      prompt: q.prompt,
      options: q.options || [],
      correctAnswer: q.correctAnswer || '',
      acceptedAnswers: q.acceptedAnswers || [],
      marks: q.marks || 1,
      topic: payload.topic || 'General',
      explanation: q.explanation || '',
      order: idx,
    }));

    const questions = await ExitTicketQuestion.insertMany(questionDocs);

    return { ticket, questions };
  }

  /**
   * Launch / Start exit ticket session.
   */
  static async startExitTicket(teacherId, ticketId) {
    const ticket = await ExitTicket.findById(ticketId);
    if (!ticket) throw ApiError.notFound('Exit ticket not found');

    if (ticket.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('Unauthorized');
    }

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + ticket.durationMinutes * 60 * 1000);

    ticket.status = EXIT_TICKET_STATUS.ACTIVE;
    ticket.startedAt = startedAt;
    ticket.endsAt = endsAt;
    await ticket.save();

    const questions = await ExitTicketQuestion.find({ exitTicketId: ticketId }).sort({ order: 1 }).lean();

    // Strip correctAnswer for student delivery
    const sanitizedQuestions = questions.map((q) => {
      const qObj = { ...q };
      delete qObj.correctAnswer;
      delete qObj.acceptedAnswers;
      return qObj;
    });

    await EngagementActivityService.logActivity({
      classroomId: ticket.classroomId,
      actorId: teacherId,
      actorRole: 'teacher',
      eventType: 'exit_ticket_launched',
      sourceModule: 'engagement',
      sourceId: ticket._id,
      title: 'Exit Ticket Launched',
      summary: ticket.title,
    });

    try {
      const io = getIO();
      io.to(`classroom:${ticket.classroomId}:engagement`).emit('engagement:exit-ticket-started', {
        ticket,
        questions: sanitizedQuestions,
      });
    } catch (_) {}

    return { ticket, questions: sanitizedQuestions };
  }

  /**
   * Submit student exit ticket attempt and auto-grade.
   */
  static async submitAttempt(studentId, ticketId, { answers = [] }) {
    const ticket = await ExitTicket.findById(ticketId);
    if (!ticket || ticket.status !== EXIT_TICKET_STATUS.ACTIVE) {
      throw ApiError.badRequest('This exit ticket session is not active');
    }

    const isEnrolled = await Enrollment.findOne({ classroomId: ticket.classroomId, studentId, status: 'active' });
    if (!isEnrolled) throw ApiError.forbidden('You are not enrolled in this classroom');

    // Check existing attempt
    const existingAttempt = await ExitTicketAttempt.findOne({ exitTicketId: ticketId, studentId });
    if (existingAttempt && existingAttempt.status !== EXIT_TICKET_ATTEMPT_STATUS.IN_PROGRESS && !ticket.allowRetry) {
      throw ApiError.badRequest('You have already submitted this exit ticket');
    }

    const questions = await ExitTicketQuestion.find({ exitTicketId: ticketId }).lean();

    // Grade Attempt
    const grading = ExitTicketGradingService.gradeAttempt(questions, answers);

    let attempt = existingAttempt;
    if (!attempt) {
      attempt = await ExitTicketAttempt.create({
        exitTicketId: ticketId,
        classroomId: ticket.classroomId,
        studentId,
        status: grading.requiresReview ? EXIT_TICKET_ATTEMPT_STATUS.REVIEW_REQUIRED : EXIT_TICKET_ATTEMPT_STATUS.AUTO_GRADED,
        startedAt: new Date(),
        submittedAt: new Date(),
        totalMarks: grading.totalMarks,
        marksAwarded: grading.marksAwarded,
        percentage: grading.percentage,
        understandingLabel: grading.understandingLabel,
        requiresReview: grading.requiresReview,
      });
    } else {
      attempt.status = grading.requiresReview ? EXIT_TICKET_ATTEMPT_STATUS.REVIEW_REQUIRED : EXIT_TICKET_ATTEMPT_STATUS.AUTO_GRADED;
      attempt.submittedAt = new Date();
      attempt.totalMarks = grading.totalMarks;
      attempt.marksAwarded = grading.marksAwarded;
      attempt.percentage = grading.percentage;
      attempt.understandingLabel = grading.understandingLabel;
      attempt.requiresReview = grading.requiresReview;
      await attempt.save();
    }

    // Save Individual Answers
    const answerDocs = grading.answerResults.map((res) => ({
      attemptId: attempt._id,
      questionId: res.questionId,
      studentId,
      responseValue: String(res.responseValue),
      isCorrect: res.isCorrect,
      marksAwarded: res.marksAwarded,
      feedback: res.feedback,
    }));

    await ExitTicketAnswer.deleteMany({ attemptId: attempt._id });
    await ExitTicketAnswer.insertMany(answerDocs);

    try {
      const io = getIO();
      io.to(`classroom:${ticket.classroomId}:engagement`).emit('engagement:exit-ticket-submitted', {
        ticketId,
        studentId,
        understandingLabel: grading.understandingLabel,
      });
    } catch (_) {}

    return {
      attemptId: attempt._id,
      percentage: grading.percentage,
      understandingLabel: grading.understandingLabel,
      totalMarks: grading.totalMarks,
      marksAwarded: grading.marksAwarded,
    };
  }

  /**
   * Close exit ticket session.
   */
  static async closeExitTicket(teacherId, ticketId) {
    const ticket = await ExitTicket.findById(ticketId);
    if (!ticket) throw ApiError.notFound('Exit ticket not found');

    if (ticket.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('Unauthorized');
    }

    ticket.status = EXIT_TICKET_STATUS.CLOSED;
    ticket.closedAt = new Date();
    await ticket.save();

    const results = await this.getExitTicketResults(ticketId, 'teacher');

    try {
      const io = getIO();
      io.to(`classroom:${ticket.classroomId}:engagement`).emit('engagement:exit-ticket-closed', {
        ticketId,
        results,
      });
    } catch (_) {}

    return { ticket, results };
  }

  /**
   * Get exit ticket results & understanding metrics.
   */
  static async getExitTicketResults(ticketId, requesterRole = 'student') {
    const ticket = await ExitTicket.findById(ticketId).lean();
    if (!ticket) throw ApiError.notFound('Exit ticket not found');

    const totalEligible = await Enrollment.countDocuments({ classroomId: ticket.classroomId, status: 'active' });
    const attempts = await ExitTicketAttempt.find({ exitTicketId: ticketId }).lean();
    const questions = await ExitTicketQuestion.find({ exitTicketId: ticketId }).sort({ order: 1 }).lean();

    const totalSubmitted = attempts.length;
    const avgPercentage = totalSubmitted > 0 ? Number((attempts.reduce((sum, a) => sum + a.percentage, 0) / totalSubmitted).toFixed(1)) : 0;

    const understandingCounts = {
      strong: 0,
      acceptable: 0,
      needs_revision: 0,
      critical: 0,
    };

    attempts.forEach((a) => {
      if (understandingCounts[a.understandingLabel] !== undefined) {
        understandingCounts[a.understandingLabel] += 1;
      }
    });

    const participationRate = totalEligible > 0 ? Number(((totalSubmitted / totalEligible) * 100).toFixed(1)) : 0;

    const sanitizedQuestions = questions.map((q) => {
      const qObj = { ...q };
      if (requesterRole !== 'teacher' && ticket.status !== 'closed') {
        delete qObj.correctAnswer;
        delete qObj.acceptedAnswers;
      }
      return qObj;
    });

    return {
      ticketId: ticket._id,
      title: ticket.title,
      topic: ticket.topic,
      status: ticket.status,
      totalEligible,
      totalSubmitted,
      participationRate,
      avgPercentage,
      understandingCounts,
      questions: sanitizedQuestions,
    };
  }
}
