import mongoose from 'mongoose';

const deadlineExtensionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
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
      default: null, // null = global extension for all students
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalDueAt: {
      type: Date,
      required: true,
    },
    extendedDueAt: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      default: 'Deadline extension granted by instructor',
    },
    status: {
      type: String,
      enum: ['active', 'revoked', 'expired'],
      default: 'active',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const DeadlineExtension = mongoose.model('DeadlineExtension', deadlineExtensionSchema);
