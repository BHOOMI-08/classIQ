import mongoose from 'mongoose';

const resourceVersionSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentResource',
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
    versionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    sourceType: {
      type: String,
      enum: ['pdf', 'document', 'text_note', 'external_link'],
      required: true,
    },
    originalFileName: {
      type: String,
      trim: true,
      default: 'resource_document',
    },
    storageKey: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileExtension: {
      type: String,
      default: 'pdf',
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    fileSizeBytes: {
      type: Number,
      default: 0,
    },
    checksum: {
      type: String,
      required: true,
      index: true,
    },
    textContent: {
      type: String,
      default: '',
    },
    extractionMetadata: {
      pageCount: { type: Number, default: 0 },
      characterCount: { type: Number, default: 0 },
      wordCount: { type: Number, default: 0 },
      warnings: [{ type: String }],
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
    changeNote: {
      type: String,
      default: 'Initial upload',
    },
  },
  {
    timestamps: true,
  }
);

resourceVersionSchema.index({ resourceId: 1, versionNumber: 1 }, { unique: true });

export const ResourceVersion = mongoose.model('ResourceVersion', resourceVersionSchema);
