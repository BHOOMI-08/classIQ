import mongoose from 'mongoose';

const aiQuizArtifactSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    generationMode: {
      type: String,
      enum: ['topic', 'resource_rag', 'revision', 'diagnostic', 'practice'],
      required: true,
    },
    sourceResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource' }],
    sourceVersionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    sourceChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentChunk' }],
    inputSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
    structuredOutput: { type: mongoose.Schema.Types.Mixed, default: null }, // raw Gemini output
    model: { type: String, default: 'gemini-1.5-flash' },
    promptVersion: { type: String, default: '1.0' },
    tokenUsage: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['generated', 'validated', 'rejected', 'saved', 'expired'],
      default: 'generated',
    },
    validationErrors: [{ type: String }],
  },
  { timestamps: true }
);

aiQuizArtifactSchema.index({ classroomId: 1, generatedBy: 1, createdAt: -1 });

export const AIQuizArtifact = mongoose.model('AIQuizArtifact', aiQuizArtifactSchema);
