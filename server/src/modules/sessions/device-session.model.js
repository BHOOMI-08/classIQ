import mongoose, { Schema } from 'mongoose';

const deviceSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    deviceType: { type: String, required: true },
    browser: { type: String, required: true },
    operatingSystem: { type: String, required: true },
    userAgent: { type: String, required: true },
    ipAddress: { type: String, required: true },
    lastActiveAt: { type: Date, default: Date.now },
    isTrusted: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    revocationReason: { type: String, default: null },
  },
  { timestamps: true }
);

deviceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DeviceSession = mongoose.model('DeviceSession', deviceSessionSchema);
