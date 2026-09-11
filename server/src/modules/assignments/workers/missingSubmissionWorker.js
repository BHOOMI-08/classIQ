import { Assignment } from '../models/assignment.model.js';
import { Submission } from '../models/submission.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { DeadlineService } from '../services/deadline.service.js';
import { logger } from '../../../utils/logger.js';

export class MissingSubmissionWorker {
  static async startWorker() {
    setInterval(async () => {
      try {
        const now = new Date();

        const pastDueAssignments = await Assignment.find({
          status: { $in: ['published', 'active'] },
          dueAt: { $lte: now },
        });

        for (const ass of pastDueAssignments) {
          const enrollments = await Enrollment.find({
            classroomId: ass.classroomId,
            status: 'active',
          }).lean();

          for (const enr of enrollments) {
            const studentId = enr.studentId;
            const deadlineInfo = await DeadlineService.resolveEffectiveDeadline({
              assignment: ass,
              studentId,
            });

            if (now > new Date(deadlineInfo.effectiveDueAt)) {
              const existingSub = await Submission.findOne({
                assignmentId: ass._id,
                studentId,
              });

              if (!existingSub) {
                await Submission.create({
                  assignmentId: ass._id,
                  classroomId: ass.classroomId,
                  studentId,
                  status: 'missing',
                  deadlineUsed: deadlineInfo.effectiveDueAt,
                });
                logger.info(`⚠️ Student ${studentId} marked MISSING for assignment ${ass._id}`);
              } else if (existingSub.status === 'draft') {
                existingSub.status = 'missing';
                await existingSub.save();
              }
            }
          }
        }
      } catch (err) {
        logger.error('Error in MissingSubmissionWorker interval:', { error: err.message });
      }
    }, 120000); // Poll every 2 minutes
  }
}
