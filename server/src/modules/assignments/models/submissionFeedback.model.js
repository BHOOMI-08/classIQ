import mongoose from 'mongoose';

const submissionFeedbackSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    submissionVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubmissionVersion',
      default: null,
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      default: null,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorRole: {
      type: String,
      enum: ['teacher', 'student', 'admin'],
      required: true,
    },
    feedbackType: {
      type: String,
      enum: ['overall', 'rubric', 'inline', 'resubmission_request', 'private_teacher_note'],
      default: 'overall',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssignmentAttachment',
      default: null,
    },
    isVisibleToStudent: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SubmissionFeedback = mongoose.model('SubmissionFeedback', submissionFeedbackSchema);
