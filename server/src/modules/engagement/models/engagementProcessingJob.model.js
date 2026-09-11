import mongoose from 'mongoose';

const engagementProcessingJobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['auto_close_pulse', 'auto_close_poll', 'auto_close_exit_ticket', 'doubt_clustering', 'confusion_heatmap_recalc'],
      required: true,
      index: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    scheduledFor: { type: Date, required: true, index: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending', index: true },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: '' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

engagementProcessingJobSchema.index({ status: 1, scheduledFor: 1 });

export const EngagementProcessingJob = mongoose.model('EngagementProcessingJob', engagementProcessingJobSchema);
