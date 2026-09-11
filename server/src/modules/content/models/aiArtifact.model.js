import mongoose from 'mongoose';

const aiArtifactSchema = new mongoose.Schema(
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
    artifactType: {
      type: String,
      enum: ['summary', 'flashcards', 'revision_questions'],
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: '',
    },
    structuredContent: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sourceChunkIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContentChunk',
      },
    ],
    model: {
      type: String,
      default: 'gemini-1.5-flash',
    },
    generationStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AIArtifact = mongoose.model('AIArtifact', aiArtifactSchema);
