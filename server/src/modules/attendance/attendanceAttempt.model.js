import mongoose, { Schema } from 'mongoose';
import { ATTEMPT_RESULT, DECISION, SUSPICION_LEVELS } from './attendance.constants.js';

const verificationChecksSchema = new Schema(
  {
    signatureValid: { type: Boolean, default: false },
    tokenFresh: { type: Boolean, default: false },
    sessionActive: { type: Boolean, default: false },
    enrollmentActive: { type: Boolean, default: false },
    duplicateDetected: { type: Boolean, default: false },
    locationProvided: { type: Boolean, default: false },
    insideGeofence: { type: Boolean, default: false },
    locationAccuracyAcceptable: { type: Boolean, default: false },
    deviceRecognized: { type: Boolean, default: false },
    challengePassed: { type: Boolean, default: true },
    rateLimitPassed: { type: Boolean, default: true },
  },
  { _id: false }
);

const suspicionSignalSchema = new Schema(
  {
    code: { type: String, required: true },
    weight: { type: Number, default: 0 },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const attemptLocationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
    accuracyMeters: Number,
    capturedAt: Date,
  },
  { _id: false }
);

const requestMetadataSchema = new Schema(
  {
    ipHash: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    requestId: { type: String, default: '' },
  },
  { _id: false }
);

const attendanceAttemptSchema = new Schema(
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
      default: null,
    },
    tokenId: {
      type: String,
      default: '',
      index: true,
    },
    tokenRotation: {
      type: Number,
      default: 0,
    },
    tokenIssuedAt: Date,
    tokenExpiresAt: Date,
    tokenNonceHash: String,

    result: {
      type: String,
      enum: Object.values(ATTEMPT_RESULT),
      required: true,
      index: true,
    },
    decision: {
      type: String,
      enum: Object.values(DECISION),
      required: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    verificationChecks: {
      type: verificationChecksSchema,
      default: () => ({}),
    },
    suspicionSignals: [suspicionSignalSchema],
    suspicionScore: {
      type: Number,
      default: 0,
    },
    suspicionLevel: {
      type: String,
      enum: Object.values(SUSPICION_LEVELS),
      default: SUSPICION_LEVELS.LOW,
      index: true,
    },

    studentLocation: {
      type: attemptLocationSchema,
      default: null,
    },
    teacherLocationSnapshot: {
      type: attemptLocationSchema,
      default: null,
    },
    distanceMeters: {
      type: Number,
      default: null,
    },

    deviceFingerprintHash: {
      type: String,
      default: '',
      index: true,
    },
    deviceSessionId: {
      type: String,
      default: '',
    },
    trustedDeviceId: {
      type: Schema.Types.ObjectId,
      ref: 'TrustedDevice',
      default: null,
    },

    networkMetadata: {
      networkType: { type: String, default: 'unknown' },
      connectionHint: { type: String, default: '' },
    },
    requestMetadata: {
      type: requestMetadataSchema,
      default: () => ({}),
    },

    challengeId: {
      type: String,
      default: null,
    },
    challengeResult: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
attendanceAttemptSchema.index({ sessionId: 1, createdAt: -1 });
attendanceAttemptSchema.index({ studentId: 1, createdAt: -1 });
attendanceAttemptSchema.index({ sessionId: 1, result: 1 });
attendanceAttemptSchema.index({ sessionId: 1, suspicionLevel: 1 });
attendanceAttemptSchema.index({ deviceFingerprintHash: 1, createdAt: -1 });

export const AttendanceAttempt = mongoose.model('AttendanceAttempt', attendanceAttemptSchema);
