import { DeadlineExtension } from '../models/deadlineExtension.model.js';
import { Assignment } from '../models/assignment.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class DeadlineExtensionService {
  static async grantExtension({ assignmentId, classroomId, studentId = null, teacherId, extendedDueAt, reason }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw ApiError.notFound('Assignment not found');

    const extension = await DeadlineExtension.create({
      assignmentId,
      classroomId: classroomId || assignment.classroomId,
      studentId: studentId || null,
      createdBy: teacherId,
      originalDueAt: assignment.dueAt,
      extendedDueAt: new Date(extendedDueAt),
      reason: reason || 'Deadline extension granted by instructor',
      status: 'active',
    });

    return extension;
  }

  static async revokeExtension(extensionId, teacherId) {
    const extension = await DeadlineExtension.findByIdAndUpdate(
      extensionId,
      { $set: { status: 'revoked', revokedAt: new Date() } },
      { new: true }
    );
    if (!extension) throw ApiError.notFound('Deadline extension not found');
    return extension;
  }

  static async getAssignmentExtensions(assignmentId) {
    return DeadlineExtension.find({ assignmentId, status: 'active' })
      .populate('studentId', 'name email rollNumber')
      .sort({ createdAt: -1 })
      .lean();
  }
}
