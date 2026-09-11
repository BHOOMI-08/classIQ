import mongoose from 'mongoose';

const assignmentAttachmentSchema = new mongoose.Schema(
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    storageKey: {
      type: String,
      default: '',
    },
    fileUrl: {
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
    attachmentType: {
      type: String,
      enum: ['question_file', 'reference_file', 'template_file', 'dataset', 'starter_code', 'other'],
      default: 'question_file',
    },
    allowStudentDownload: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AssignmentAttachment = mongoose.model('AssignmentAttachment', assignmentAttachmentSchema);
