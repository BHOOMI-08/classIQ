import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: ['active', 'left', 'removed', 'blocked'],
      default: 'active',
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    blockReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollment records for the same classroom and student
enrollmentSchema.index({ classroomId: 1, studentId: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ classroomId: 1, status: 1 });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
