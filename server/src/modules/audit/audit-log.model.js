import mongoose, { Schema } from 'mongoose';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';

const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, enum: Object.values(AUDIT_EVENTS), required: true, index: true },
    resourceType: { type: String },
    resourceId: { type: String },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
