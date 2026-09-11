import mongoose, { Schema } from 'mongoose';
import { TRUST_STATUS } from './attendance.constants.js';

const trustedDeviceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    deviceFingerprintHash: {
      type: String,
      required: true,
      index: true,
    },
    label: {
      type: String,
      default: 'Unknown Device',
    },
    platform: {
      type: String,
      default: 'web',
    },
    browser: {
      type: String,
      default: 'unknown',
    },
    os: {
      type: String,
      default: 'unknown',
    },
    trustStatus: {
      type: String,
      enum: Object.values(TRUST_STATUS),
      default: TRUST_STATUS.UNVERIFIED,
      index: true,
    },
    trustedAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    riskScore: {
      type: Number,
      default: 0,
    },
    riskSignals: [
      {
        code: String,
        detectedAt: { type: Date, default: Date.now },
      },
    ],
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    revokeReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes
trustedDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
trustedDeviceSchema.index({ userId: 1, trustStatus: 1 });

export const TrustedDevice = mongoose.model('TrustedDevice', trustedDeviceSchema);
