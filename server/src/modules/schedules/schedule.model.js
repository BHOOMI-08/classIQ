import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
      lowercase: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
    timezone: {
      type: String,
      trim: true,
      default: 'UTC',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ classroomId: 1, dayOfWeek: 1, startTime: 1 });

export const Schedule = mongoose.model('Schedule', scheduleSchema);
