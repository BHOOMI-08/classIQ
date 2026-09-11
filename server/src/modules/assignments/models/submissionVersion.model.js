import mongoose from 'mongoose';

const submissionVersionSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true,
    },
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
    versionNumber: {
      type: Number,
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
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
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isFinal: {
      type: Boolean,
      default: true,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    lateByMinutes: {
      type: Number,
      default: 0,
    },
    deadlineUsed: {
      type: Date,
      required: true,
    },
    checksum: {
      type: String,
      required: true,
    },
    changeNote: {
      type: String,
      default: 'Student submission version',
    },
    replacedVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubmissionVersion',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

submissionVersionSchema.index({ submissionId: 1, versionNumber: 1 }, { unique: true });

export const SubmissionVersion = mongoose.model('SubmissionVersion', submissionVersionSchema);
