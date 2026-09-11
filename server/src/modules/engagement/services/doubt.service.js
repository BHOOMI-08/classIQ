import { Doubt } from '../models/doubt.model.js';
import { DoubtUpvote } from '../models/doubtUpvote.model.js';
import { DoubtCluster } from '../models/doubtCluster.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { DoubtMatchingService } from './doubtMatching.service.js';
import { DoubtPriorityService } from './doubtPriority.service.js';
import { normalizeText } from '../utils/textSimilarity.utils.js';
import { EngagementActivityService } from './engagementActivity.service.js';
import { getIO } from '../../../socket/socket.server.js';
import { ApiError } from '../../../utils/api-error.js';

export class DoubtService {
  /**
   * Submit an anonymous doubt with automatic deduplication check.
   */
  static async submitDoubt(studentId, classId, payload) {
    const isEnrolled = await Enrollment.findOne({ classroomId: classId, studentId, status: 'active' });
    if (!isEnrolled) throw ApiError.forbidden('You are not enrolled in this classroom');

    const normalized = normalizeText(payload.text);

    // Perform Deduplication Search
    const matchResult = await DoubtMatchingService.findMatchingDoubts(classId, payload.text);

    const doubt = await Doubt.create({
      classroomId: classId,
      studentId,
      topic: payload.topic || 'General',
      text: payload.text,
      normalizedText: normalized,
      resourceId: payload.resourceId || null,
      anonymous: payload.anonymous !== false,
      similarDoubtCount: matchResult.matchingDoubts.length,
      priorityScore: 1 + matchResult.matchingDoubts.length * 2,
    });

    // Log activity
    await EngagementActivityService.logActivity({
      classroomId: classId,
      actorId: studentId,
      actorRole: 'student',
      eventType: 'doubt_submitted',
      sourceModule: 'engagement',
      sourceId: doubt._id,
      title: 'Anonymous Doubt Submitted',
      summary: doubt.text,
      visibility: 'all_members',
    });

    // Broadcast Real-time Doubt Created event (STRIP studentId for teacher & student UI)
    const sanitizedDoubt = this.sanitizeDoubtForTeacher(doubt);
    try {
      const io = getIO();
      io.to(`classroom:${classId}:engagement`).emit('engagement:doubt-created', {
        doubt: sanitizedDoubt,
        matchResult,
      });
    } catch (_) {}

    return { doubt: sanitizedDoubt, matchResult };
  }

  /**
   * Upvote a doubt (enforce 1 upvote per student per doubt).
   */
  static async upvoteDoubt(studentId, doubtId) {
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) throw ApiError.notFound('Doubt not found');

    const isEnrolled = await Enrollment.findOne({ classroomId: doubt.classroomId, studentId, status: 'active' });
    if (!isEnrolled) throw ApiError.forbidden('Enrolled students only');

    const existingUpvote = await DoubtUpvote.findOne({ doubtId, studentId });
    if (existingUpvote) {
      throw ApiError.badRequest('You have already upvoted this doubt');
    }

    await DoubtUpvote.create({
      doubtId,
      classroomId: doubt.classroomId,
      studentId,
    });

    doubt.upvoteCount += 1;
    await doubt.save();

    // Recalculate priority score
    const newPriority = await DoubtPriorityService.recalculatePriority(doubtId);

    const sanitizedDoubt = this.sanitizeDoubtForTeacher(doubt);
    try {
      const io = getIO();
      io.to(`classroom:${doubt.classroomId}:engagement`).emit('engagement:doubt-upvoted', {
        doubtId,
        upvoteCount: doubt.upvoteCount,
        priorityScore: newPriority,
      });
    } catch (_) {}

    return { doubt: sanitizedDoubt, upvoteCount: doubt.upvoteCount };
  }

  /**
   * Remove student upvote.
   */
  static async removeUpvote(studentId, doubtId) {
    const upvote = await DoubtUpvote.findOneAndDelete({ doubtId, studentId });
    if (!upvote) throw ApiError.notFound('Upvote not found');

    const doubt = await Doubt.findById(doubtId);
    if (doubt) {
      doubt.upvoteCount = Math.max(0, doubt.upvoteCount - 1);
      await doubt.save();
      await DoubtPriorityService.recalculatePriority(doubtId);
    }

    return { success: true };
  }

  /**
   * Teacher resolves a doubt with optional resolution note.
   */
  static async resolveDoubt(teacherId, doubtId, resolutionNote = '') {
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) throw ApiError.notFound('Doubt not found');

    const classroom = await Classroom.findById(doubt.classroomId).lean();
    if (!classroom || classroom.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('Unauthorized');
    }

    doubt.status = 'resolved';
    doubt.resolvedAt = new Date();
    doubt.resolvedBy = teacherId;
    doubt.resolutionNote = resolutionNote;
    await doubt.save();

    await EngagementActivityService.logActivity({
      classroomId: doubt.classroomId,
      actorId: teacherId,
      actorRole: 'teacher',
      eventType: 'doubt_resolved',
      sourceModule: 'engagement',
      sourceId: doubt._id,
      title: 'Doubt Resolved',
      summary: resolutionNote || doubt.text,
    });

    const sanitizedDoubt = this.sanitizeDoubtForTeacher(doubt);
    try {
      const io = getIO();
      io.to(`classroom:${doubt.classroomId}:engagement`).emit('engagement:doubt-resolved', {
        doubt: sanitizedDoubt,
      });
    } catch (_) {}

    return sanitizedDoubt;
  }

  /**
   * Fetch classroom doubts sorted by priority score, topic, or status.
   * Strips student identity for teacher & classmate responses!
   */
  static async getClassroomDoubts(classId, { status, topic }) {
    const filter = { classroomId: classId };
    if (status) filter.status = status;
    else filter.status = { $ne: 'archived' };
    if (topic) filter.topic = topic;

    const doubts = await Doubt.find(filter).sort({ priorityScore: -1, createdAt: -1 }).lean();
    const clusters = await DoubtCluster.find({ classroomId: classId, status: 'active' }).lean();

    const sanitizedDoubts = doubts.map((d) => this.sanitizeDoubtForTeacher(d));

    return { doubts: sanitizedDoubts, clusters };
  }

  /**
   * Helper: Strip student identity for anonymous doubts.
   */
  static sanitizeDoubtForTeacher(doubtDoc) {
    const doc = doubtDoc.toObject ? doubtDoc.toObject() : { ...doubtDoc };
    delete doc.studentId; // Never reveal student ID in anonymous payloads!
    return doc;
  }
}
