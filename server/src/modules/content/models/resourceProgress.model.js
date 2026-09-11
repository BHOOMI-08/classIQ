import mongoose from 'mongoose';

const resourceProgressSchema = new mongoose.Schema(
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
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firstOpenedAt: {
      type: Date,
      default: Date.now,
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
      index: true,
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    estimatedTimeSpentSeconds: {
      type: Number,
      default: 0,
    },
    totalOpenCount: {
      type: Number,
      default: 1,
    },
    totalDownloadCount: {
      type: Number,
      default: 0,
    },
    markedCompletedManually: {
      type: Boolean,
      default: false,
    },
    currentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceVersion',
    },
  },
  {
    timestamps: true,
  }
);

resourceProgressSchema.index({ resourceId: 1, studentId: 1 }, { unique: true });

export const ResourceProgress = mongoose.model('ResourceProgress', resourceProgressSchema);
