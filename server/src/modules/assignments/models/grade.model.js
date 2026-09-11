import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
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
      required: true,
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
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rawMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    rubricMarks: {
      type: Number,
      default: 0,
    },
    adjustmentMarks: {
      type: Number,
      default: 0,
    },
    latePenaltyMarks: {
      type: Number,
      default: 0,
    },
    finalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    gradeLabel: {
      type: String,
      default: 'Ungraded',
    },
    status: {
      type: String,
      enum: ['draft', 'finalized', 'published', 'superseded'],
      default: 'draft',
      index: true,
    },
    gradingVersion: {
      type: Number,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    internalNote: {
      type: String,
      default: '',
    },
    overallFeedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Grade = mongoose.model('Grade', gradeSchema);
