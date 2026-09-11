import mongoose, { Schema } from 'mongoose';
import { RECORD_STATUS, DECISION, CORRECTION_TYPES } from './attendance.constants.js';

const attendanceCorrectionSchema = new Schema(
  {
    attendanceRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceRecord',
      required: true,
      index: true,
    },
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
    previousStatus: {
      type: String,
      enum: Object.values(RECORD_STATUS),
      required: true,
    },
    newStatus: {
      type: String,
      enum: Object.values(RECORD_STATUS),
      required: true,
    },
    previousDecision: {
      type: String,
      enum: Object.values(DECISION),
      required: true,
    },
    newDecision: {
      type: String,
      enum: Object.values(DECISION),
      required: true,
    },
    reason: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1000,
      trim: true,
    },
    correctionType: {
      type: String,
      enum: Object.values(CORRECTION_TYPES),
      default: CORRECTION_TYPES.STATUS_CHANGE,
    },
    correctedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    correctedAt: {
      type: Date,
      default: Date.now,
    },
    evidence: {
      type: String,
      default: '',
    },
    requestMetadata: {
      ipHash: { type: String, default: '' },
      userAgent: { type: String, default: '' },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
attendanceCorrectionSchema.index({ attendanceRecordId: 1, createdAt: -1 });
attendanceCorrectionSchema.index({ sessionId: 1, createdAt: -1 });
attendanceCorrectionSchema.index({ studentId: 1, createdAt: -1 });
attendanceCorrectionSchema.index({ correctedBy: 1, createdAt: -1 });

export const AttendanceCorrection = mongoose.model('AttendanceCorrection', attendanceCorrectionSchema);
