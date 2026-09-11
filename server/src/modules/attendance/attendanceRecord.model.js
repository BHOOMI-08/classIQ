import mongoose, { Schema } from 'mongoose';
import { RECORD_STATUS, DECISION, SUSPICION_LEVELS, MARK_SOURCE } from './attendance.constants.js';

const verificationSummarySchema = new Schema(
  {
    signatureValid: { type: Boolean, default: false },
    tokenFresh: { type: Boolean, default: false },
    enrolled: { type: Boolean, default: false },
    duplicate: { type: Boolean, default: false },
    insideGeofence: { type: Boolean, default: true },
    locationAccuracyAcceptable: { type: Boolean, default: true },
    deviceTrusted: { type: Boolean, default: true },
    presenceChallengePassed: { type: Boolean, default: true },
  },
  { _id: false }
);

const recordLocationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
    accuracyMeters: Number,
    capturedAt: Date,
    distanceFromTeacherMeters: Number,
  },
  { _id: false }
);

const attendanceRecordSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
      index: true,
    },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RECORD_STATUS),
      required: true,
      index: true,
    },
    decision: {
      type: String,
      enum: Object.values(DECISION),
      required: true,
      default: DECISION.ACCEPTED,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lateByMinutes: {
      type: Number,
      default: 0,
    },
    verificationSummary: {
      type: verificationSummarySchema,
      default: () => ({}),
    },
    suspicionScore: {
      type: Number,
      default: 0,
    },
    suspicionLevel: {
      type: String,
      enum: Object.values(SUSPICION_LEVELS),
      default: SUSPICION_LEVELS.LOW,
    },
    location: {
      type: recordLocationSchema,
      default: null,
    },
    deviceId: {
      type: String,
      default: '',
    },
    acceptedAttemptId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceAttempt',
      default: null,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    markSource: {
      type: String,
      enum: Object.values(MARK_SOURCE),
      default: MARK_SOURCE.STUDENT_SCAN,
    },
    correctionCount: {
      type: Number,
      default: 0,
    },
    lastCorrectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Mandatory unique compound index: exactly 1 AttendanceRecord per student per session
attendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

// Additional indexes
attendanceRecordSchema.index({ classroomId: 1, studentId: 1, createdAt: -1 });
attendanceRecordSchema.index({ sessionId: 1, status: 1 });
attendanceRecordSchema.index({ studentId: 1, createdAt: -1 });
attendanceRecordSchema.index({ classroomId: 1, status: 1, createdAt: -1 });

export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
