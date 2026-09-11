import mongoose from 'mongoose';

const doubtUpvoteSchema = new mongoose.Schema(
  {
    doubtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doubt', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

doubtUpvoteSchema.index({ doubtId: 1, studentId: 1 }, { unique: true });

export const DoubtUpvote = mongoose.model('DoubtUpvote', doubtUpvoteSchema);
