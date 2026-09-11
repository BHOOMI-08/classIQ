import mongoose from 'mongoose';

const engagementAnalyticsSnapshotSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    snapshotType: { type: String, enum: ['topic_confusion', 'classroom_overview', 'session_summary'], required: true },
    topic: { type: String, default: 'Overall' },
    metrics: {
      quizErrorRate: { type: Number, default: 0 },
      exitTicketErrorRate: { type: Number, default: 0 },
      pulseConfusionRate: { type: Number, default: 0 },
      doubtIntensity: { type: Number, default: 0 },
      revisionFrequency: { type: Number, default: 0 },
      confusionScore: { type: Number, default: 0 },
    },
    classification: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'low' },
    evidence: { type: mongoose.Schema.Types.Mixed, default: {} },
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

engagementAnalyticsSnapshotSchema.index({ classroomId: 1, topic: 1, calculatedAt: -1 });

export const EngagementAnalyticsSnapshot = mongoose.model('EngagementAnalyticsSnapshot', engagementAnalyticsSnapshotSchema);
