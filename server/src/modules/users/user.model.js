import mongoose, { Schema } from 'mongoose';
import { ROLES, ALLOWED_ROLES } from '../../constants/roles.js';
import { AUTH_CONSTANTS } from '../../constants/auth.constants.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ALLOWED_ROLES, required: true },
    avatarUrl: { type: String, default: '' },
    avatarStorageKey: { type: String, default: '' },
    accountStatus: {
      type: String,
      enum: Object.values(AUTH_CONSTANTS.ACCOUNT_STATUS),
      default: AUTH_CONSTANTS.ACCOUNT_STATUS.PENDING_VERIFICATION,
    },
    isEmailVerified: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model('User', userSchema);
