import mongoose from 'mongoose';

const revisionQueueItemSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentResource',
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    reason: {
      type: String,
      trim: true,
      default: 'Manual addition for exam review',
    },
    source: {
      type: String,
      enum: ['manual', 'bookmarked', 'low_quiz_score', 'weak_topic', 'ai_recommendation'],
      default: 'manual',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'removed'],
      default: 'pending',
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

revisionQueueItemSchema.index({ studentId: 1, resourceId: 1, status: 1 });

export const RevisionQueueItem = mongoose.model('RevisionQueueItem', revisionQueueItemSchema);
