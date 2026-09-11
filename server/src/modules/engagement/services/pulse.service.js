import { ClassroomPulse } from '../models/classroomPulse.model.js';
import { PulseResponse } from '../models/pulseResponse.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { PULSE_STATUS, PULSE_OPTIONS, PULSE_OPTION_WEIGHTS } from '../utils/engagement.constants.js';
import { calculateConfidenceIndex } from '../utils/engagementScoring.utils.js';
import { EngagementActivityService } from './engagementActivity.service.js';
import { getIO } from '../../../socket/socket.server.js';
import { ApiError } from '../../../utils/api-error.js';

export class PulseService {
  /**
   * Start a new Classroom Confidence Pulse session.
   */
  static async createPulse(teacherId, classId, payload) {
    // 1. Verify Classroom Ownership
    const classroom = await Classroom.findById(classId).lean();
    if (!classroom || classroom.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('You are not the owner of this classroom');
    }

    // 2. Auto-close any existing active pulse for this classroom
    const activePulse = await ClassroomPulse.findOne({ classroomId: classId, status: PULSE_STATUS.ACTIVE });
    if (activePulse) {
      activePulse.status = PULSE_STATUS.CLOSED;
      activePulse.closedAt = new Date();
      await activePulse.save();
    }

    const durationMinutes = payload.durationMinutes || 5;
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

    const pulse = await ClassroomPulse.create({
      classroomId: classId,
      teacherId,
      topic: payload.topic || 'General Topic',
      prompt: payload.prompt || 'How confident are you with this topic?',
      options: [PULSE_OPTIONS.CONFUSED, PULSE_OPTIONS.PARTIALLY_CLEAR, PULSE_OPTIONS.CLEAR, PULSE_OPTIONS.CAN_EXPLAIN],
      status: PULSE_STATUS.ACTIVE,
      anonymous: payload.anonymous !== false,
      allowResponseChange: payload.allowResponseChange !== false,
      showResultsToStudents: payload.showResultsToStudents !== false,
      startedAt,
      endsAt,
    });

    // Log Classroom Activity
    await EngagementActivityService.logActivity({
      classroomId: classId,
      actorId: teacherId,
      actorRole: 'teacher',
      eventType: 'pulse_started',
      sourceModule: 'engagement',
      sourceId: pulse._id,
      title: 'Confidence Pulse Started',
      summary: pulse.prompt,
    });

    // Broadcast Socket Event
    try {
      const io = getIO();
      io.to(`classroom:${classId}:engagement`).emit('engagement:pulse-started', { pulse });
    } catch (_) {}

    return pulse;
  }

  /**
   * Submit or update student pulse confidence response.
   */
  static async respondPulse(studentId, pulseId, responseOption) {
    const pulse = await ClassroomPulse.findById(pulseId);
    if (!pulse || pulse.status !== PULSE_STATUS.ACTIVE) {
      throw ApiError.badRequest('This pulse session is not active');
    }

    // Check enrollment
    const isEnrolled = await Enrollment.findOne({ classroomId: pulse.classroomId, studentId, status: 'active' });
    if (!isEnrolled) {
      throw ApiError.forbidden('You are not enrolled in this classroom');
    }

    const weight = PULSE_OPTION_WEIGHTS[responseOption];
    if (weight === undefined) {
      throw ApiError.badRequest('Invalid pulse response option');
    }

    let responseDoc = await PulseResponse.findOne({ pulseId, studentId });
    if (responseDoc) {
      if (!pulse.allowResponseChange) {
        throw ApiError.badRequest('Response updates are disabled for this pulse session');
      }
      responseDoc.response = responseOption;
      responseDoc.responseWeight = weight;
      responseDoc.lastRespondedAt = new Date();
      responseDoc.changeCount += 1;
      await responseDoc.save();
    } else {
      responseDoc = await PulseResponse.create({
        pulseId,
        classroomId: pulse.classroomId,
        studentId,
        response: responseOption,
        responseWeight: weight,
      });
      pulse.totalResponses += 1;
    }

    // Recalculate Confidence Index
    const analytics = await this.getPulseResults(pulseId);
    pulse.confidenceIndex = analytics.confidenceIndex;
    await pulse.save();

    // Broadcast Socket.IO update (strip studentId for anonymous mode in teacher payloads)
    try {
      const io = getIO();
      io.to(`classroom:${pulse.classroomId}:engagement`).emit('engagement:pulse-updated', {
        pulseId,
        analytics,
      });
    } catch (_) {}

    return responseDoc;
  }

  /**
   * Manually close pulse session.
   */
  static async closePulse(teacherId, pulseId) {
    const pulse = await ClassroomPulse.findById(pulseId);
    if (!pulse) throw ApiError.notFound('Pulse session not found');

    if (pulse.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('You are not authorized to close this pulse');
    }

    pulse.status = PULSE_STATUS.CLOSED;
    pulse.closedAt = new Date();
    await pulse.save();

    const analytics = await this.getPulseResults(pulseId);

    // Log Activity
    await EngagementActivityService.logActivity({
      classroomId: pulse.classroomId,
      actorId: teacherId,
      actorRole: 'teacher',
      eventType: 'pulse_closed',
      sourceModule: 'engagement',
      sourceId: pulse._id,
      title: 'Confidence Pulse Closed',
      summary: `Confidence Index: ${analytics.confidenceIndex ?? 'N/A'}%`,
    });

    try {
      const io = getIO();
      io.to(`classroom:${pulse.classroomId}:engagement`).emit('engagement:pulse-closed', {
        pulseId,
        analytics,
      });
    } catch (_) {}

    return { pulse, analytics };
  }

  /**
   * Calculate live pulse results and statistics.
   */
  static async getPulseResults(pulseId) {
    const pulse = await ClassroomPulse.findById(pulseId).lean();
    if (!pulse) throw ApiError.notFound('Pulse not found');

    const totalEligibleStudents = await Enrollment.countDocuments({
      classroomId: pulse.classroomId,
      status: 'active',
    });

    const responses = await PulseResponse.find({ pulseId }).lean();
    const totalResponses = responses.length;

    const counts = {
      confused: 0,
      partially_clear: 0,
      clear: 0,
      can_explain: 0,
    };

    responses.forEach((r) => {
      if (counts[r.response] !== undefined) {
        counts[r.response] += 1;
      }
    });

    const percentages = {};
    Object.keys(counts).forEach((k) => {
      percentages[k] = totalResponses > 0 ? Number(((counts[k] / totalResponses) * 100).toFixed(1)) : 0;
    });

    const scoreResult = calculateConfidenceIndex(counts);
    const nonResponseCount = Math.max(0, totalEligibleStudents - totalResponses);
    const responseRate = totalEligibleStudents > 0 ? Number(((totalResponses / totalEligibleStudents) * 100).toFixed(1)) : 0;

    return {
      pulseId: pulse._id,
      topic: pulse.topic,
      status: pulse.status,
      totalEligibleStudents,
      totalResponses,
      nonResponseCount,
      responseRate,
      counts,
      percentages,
      confidenceIndex: scoreResult?.confidenceIndex ?? null,
      confidenceLabel: scoreResult?.label ?? null,
    };
  }
}
