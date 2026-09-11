import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    joinCodeExpiresAt: {
      type: Date,
      default: null,
    },
    attendanceThreshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    maximumStudents: {
      type: Number,
      default: null,
    },
    allowStudentLeave: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for teacher classroom queries
classroomSchema.index({ teacherId: 1, status: 1 });
classroomSchema.index({ department: 1, semester: 1, section: 1 });

export const Classroom = mongoose.model('Classroom', classroomSchema);
