import mongoose, { Schema } from 'mongoose';
import { SESSION_STATUS } from './attendance.constants.js';

const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    accuracyMeters: {
      type: Number,
      default: 0,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const sessionStatsSchema = new Schema(
  {
    totalEnrolled: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    pendingReview: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    suspicious: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
  },
  { _id: false }
);

const attendanceSessionSchema = new Schema(
  {
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Schedule',
      default: null,
    },
    title: {
      type: String,
      trim: true,
      default: 'Class Attendance',
    },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.ACTIVE,
      index: true,
    },
    startsAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endsAt: {
      type: Date,
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 10,
    },
    qrRotationSeconds: {
      type: Number,
      required: true,
      default: 15,
    },
    currentRotation: {
      type: Number,
      default: 0,
    },
    currentNonceHash: {
      type: String,
      default: '',
    },
    teacherLocation: {
      type: pointSchema,
      default: null,
    },
    geofenceRadiusMeters: {
      type: Number,
      default: 100,
    },
    locationRequired: {
      type: Boolean,
      default: false,
    },
    lateAfterMinutes: {
      type: Number,
      default: 5,
    },
    presenceChallengeEnabled: {
      type: Boolean,
      default: false,
    },
    deviceVerificationEnabled: {
      type: Boolean,
      default: true,
    },
    manualReviewEnabled: {
      type: Boolean,
      default: true,
    },
    sessionSecretVersion: {
      type: Number,
      default: 1,
    },
    endedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    endReason: {
      type: String,
      default: '',
    },
    stats: {
      type: sessionStatsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// Indexes
attendanceSessionSchema.index({ classroomId: 1, status: 1 });
attendanceSessionSchema.index({ teacherId: 1, status: 1 });
attendanceSessionSchema.index({ classroomId: 1, startedAt: -1 });
attendanceSessionSchema.index({ status: 1, endsAt: 1 });
attendanceSessionSchema.index({ teacherLocation: '2dsphere' });

// Partial unique index: only 1 active session per classroom at a time
attendanceSessionSchema.index(
  { classroomId: 1 },
  { unique: true, partialFilterExpression: { status: SESSION_STATUS.ACTIVE } }
);

export const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
