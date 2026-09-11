import mongoose from 'mongoose';

const doubtClusterMemberSchema = new mongoose.Schema(
  {
    clusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoubtCluster', required: true, index: true },
    doubtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doubt', required: true, index: true },
    similarityScore: { type: Number, default: 0.8 },
  },
  { timestamps: true }
);

doubtClusterMemberSchema.index({ clusterId: 1, doubtId: 1 }, { unique: true });

export const DoubtClusterMember = mongoose.model('DoubtClusterMember', doubtClusterMemberSchema);
