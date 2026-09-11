import mongoose from 'mongoose';

const contentResourceSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentModule',
      default: null,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    resourceType: {
      type: String,
      enum: ['pdf', 'document', 'text_note', 'external_link'],
      required: true,
      index: true,
    },
    topic: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'General',
      index: true,
    },
    unit: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'Unit 1',
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    visibility: {
      type: String,
      enum: ['classroom', 'teacher_only'],
      default: 'classroom',
    },
    status: {
      type: String,
      enum: ['draft', 'uploaded', 'processing', 'ready', 'published', 'unpublished', 'failed', 'archived'],
      default: 'draft',
      index: true,
    },
    currentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceVersion',
      default: null,
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    processingErrorCode: {
      type: String,
      default: null,
    },
    processingErrorMessage: {
      type: String,
      default: null,
    },
    indexingStatus: {
      type: String,
      enum: ['not_indexed', 'indexing', 'indexed', 'failed'],
      default: 'not_indexed',
    },
    totalVersions: {
      type: Number,
      default: 1,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    estimatedReadingMinutes: {
      type: Number,
      default: 1,
    },
    allowDownload: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    // External Link Specifics
    externalUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

contentResourceSchema.index({ classroomId: 1, slug: 1 }, { unique: true });
contentResourceSchema.index({ classroomId: 1, status: 1, createdAt: -1 });
contentResourceSchema.index({ classroomId: 1, moduleId: 1, order: 1 });
contentResourceSchema.index({ tags: 1 });

export const ContentResource = mongoose.model('ContentResource', contentResourceSchema);
