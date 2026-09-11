import mongoose from 'mongoose';

const contentChunkSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentResource',
      required: true,
      index: true,
    },
    resourceVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceVersion',
      required: true,
      index: true,
    },
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
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    normalizedText: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    embeddingModel: {
      type: String,
      default: 'text-embedding-004',
    },
    embeddingDimension: {
      type: Number,
      default: 768,
    },
    tokenEstimate: {
      type: Number,
      default: 0,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    sectionTitle: {
      type: String,
      default: 'General Section',
    },
    headingPath: {
      type: String,
      default: '',
    },
    topic: {
      type: String,
      default: 'General',
    },
    unit: {
      type: String,
      default: 'Unit 1',
    },
    checksum: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

contentChunkSchema.index({ resourceVersionId: 1, chunkIndex: 1 }, { unique: true });
contentChunkSchema.index({ classroomId: 1, isActive: 1 });
contentChunkSchema.index({ resourceId: 1, isActive: 1 });

export const ContentChunk = mongoose.model('ContentChunk', contentChunkSchema);
