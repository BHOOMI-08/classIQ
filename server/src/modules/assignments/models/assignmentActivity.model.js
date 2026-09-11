import mongoose from 'mongoose';

const assignmentActivitySchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['teacher', 'student', 'admin', 'system'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'assignment_created',
        'assignment_updated',
        'assignment_scheduled',
        'assignment_published',
        'assignment_unpublished',
        'assignment_archived',
        'assignment_cancelled',
        'assignment_duplicated',
        'deadline_extended',
        'deadline_extension_revoked',
        'submission_draft_saved',
        'submission_uploaded',
        'submission_replaced',
        'submission_finalized',
        'submission_late',
        'submission_withdrawn',
        'review_started',
        'grade_draft_saved',
        'grade_published',
        'assignment_returned',
        'changes_requested',
        'resubmission_completed',
        'grade_revised',
        'attachment_downloaded',
        'ai_assignment_generated',
        'ai_rubric_generated',
      ],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const AssignmentActivity = mongoose.model('AssignmentActivity', assignmentActivitySchema);
