import mongoose from 'mongoose';

const doubtClusterSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    representativeDoubtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doubt', default: null },
    memberCount: { type: Number, default: 0 },
    totalUpvotes: { type: Number, default: 0 },
    priorityScore: { type: Number, default: 1 },
    confidence: { type: Number, default: 0.8 },
    status: { type: String, enum: ['active', 'resolved', 'archived'], default: 'active', index: true },
  },
  { timestamps: true }
);

doubtClusterSchema.index({ classroomId: 1, status: 1, priorityScore: -1 });

export const DoubtCluster = mongoose.model('DoubtCluster', doubtClusterSchema);
