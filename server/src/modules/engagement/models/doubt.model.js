import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, default: 'General' },
    text: { type: String, required: true },
    normalizedText: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource', default: null },
    status: {
      type: String,
      enum: ['open', 'grouped', 'acknowledged', 'resolved', 'archived', 'rejected'],
      default: 'open',
      index: true,
    },
    anonymous: { type: Boolean, default: true },
    upvoteCount: { type: Number, default: 0 },
    similarDoubtCount: { type: Number, default: 0 },
    priorityScore: { type: Number, default: 1, index: true },
    clusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoubtCluster', default: null, index: true },
    acknowledgedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionNote: { type: String, default: '' },
  },
  { timestamps: true }
);

doubtSchema.index({ classroomId: 1, status: 1, createdAt: -1 });
doubtSchema.index({ classroomId: 1, topic: 1, status: 1 });

export const Doubt = mongoose.model('Doubt', doubtSchema);
