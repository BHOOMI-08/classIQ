import { DeadlineExtension } from '../models/deadlineExtension.model.js';

export class DeadlineService {
  /**
   * Resolve the effective deadline for a student on an assignment.
   * Priority:
   * 1. Active student-specific extension
   * 2. Active global extension
   * 3. Assignment dueAt
   */
  static async resolveEffectiveDeadline({ assignment, studentId }) {
    if (!assignment) return null;

    let extension = null;
    if (studentId) {
      // 1. Check student-specific active extension
      extension = await DeadlineExtension.findOne({
        assignmentId: assignment._id,
        studentId,
        status: 'active',
      }).sort({ extendedDueAt: -1 });
    }

    if (!extension) {
      // 2. Check global active extension (studentId is null)
      extension = await DeadlineExtension.findOne({
        assignmentId: assignment._id,
        studentId: null,
        status: 'active',
      }).sort({ extendedDueAt: -1 });
    }

    const effectiveDueAt = extension ? extension.extendedDueAt : assignment.dueAt;
    const extensionId = extension ? extension._id : null;

    return {
      originalDueAt: assignment.dueAt,
      effectiveDueAt,
      isExtended: !!extension,
      extensionId,
      closingAt: assignment.closingAt,
    };
  }

  /**
   * Determine late status and duration in minutes.
   */
  static calculateLateStatus(submittedAt, effectiveDueAt) {
    const subTime = new Date(submittedAt).getTime();
    const dueTime = new Date(effectiveDueAt).getTime();

    if (subTime <= dueTime) {
      return { isLate: false, lateByMinutes: 0 };
    }

    const diffMs = subTime - dueTime;
    const lateByMinutes = Math.ceil(diffMs / (1000 * 60));

    return { isLate: true, lateByMinutes };
  }
}
