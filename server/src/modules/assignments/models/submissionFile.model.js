import mongoose from 'mongoose';

const submissionFileSchema = new mongoose.Schema(
  {
    submissionVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubmissionVersion',
      required: true,
      index: true,
    },
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
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    storageProvider: {
      type: String,
      default: 'local',
    },
    storageKey: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    filePublicId: {
      type: String,
      default: '',
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileExtension: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    checksum: {
      type: String,
      required: true,
      index: true,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    uploadStatus: {
      type: String,
      enum: ['uploaded', 'failed', 'deleted'],
      default: 'uploaded',
    },
    scanStatus: {
      type: String,
      enum: ['not_configured', 'pending', 'clean', 'suspicious', 'failed'],
      default: 'not_configured',
    },
  },
  {
    timestamps: true,
  }
);

export const SubmissionFile = mongoose.model('SubmissionFile', submissionFileSchema);
