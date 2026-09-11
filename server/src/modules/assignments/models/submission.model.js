import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    currentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubmissionVersion',
      default: null,
    },
    status: {
      type: String,
      enum: ['not_started', 'draft', 'submitted', 'late', 'resubmitted', 'under_review', 'changes_requested', 'graded', 'returned', 'missing', 'withdrawn'],
      default: 'draft',
      index: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    totalAttempts: {
      type: Number,
      default: 1,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    firstSubmittedAt: {
      type: Date,
      default: null,
    },
    lastSubmittedAt: {
      type: Date,
      default: null,
    },
    isLate: {
      type: Boolean,
      default: false,
      index: true,
    },
    lateByMinutes: {
      type: Number,
      default: 0,
    },
    latePenaltyApplied: {
      type: Boolean,
      default: false,
    },
    latePenaltyMarks: {
      type: Number,
      default: 0,
    },
    deadlineUsed: {
      type: Date,
      required: true,
    },
    deadlineExtensionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeadlineExtension',
      default: null,
    },
    submissionText: {
      type: String,
      default: '',
    },
    submissionNote: {
      type: String,
      default: '',
    },
    externalLink: {
      type: String,
      default: null,
    },
    teacherReviewStartedAt: {
      type: Date,
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    changesRequestedAt: {
      type: Date,
      default: null,
    },
    resubmissionAllowed: {
      type: Boolean,
      default: false,
    },
    resubmissionDueAt: {
      type: Date,
      default: null,
    },
    finalGradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      default: null,
    },
    receiptCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ assignmentId: 1, status: 1, submittedAt: -1 });

export const Submission = mongoose.model('Submission', submissionSchema);
