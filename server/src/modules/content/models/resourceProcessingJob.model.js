import mongoose from 'mongoose';

const resourceProcessingJobSchema = new mongoose.Schema(
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
    jobType: {
      type: String,
      enum: [
        'extract_text',
        'clean_text',
        'chunk_text',
        'generate_embeddings',
        'index_vectors',
        'full_rag_pipeline',
      ],
      default: 'full_rag_pipeline',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    lastErrorCode: {
      type: String,
      default: null,
    },
    lastErrorMessage: {
      type: String,
      default: null,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const ResourceProcessingJob = mongoose.model('ResourceProcessingJob', resourceProcessingJobSchema);
