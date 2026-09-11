import { AuditLog } from './audit-log.model.js';
import { logger } from '../../utils/logger.js';

export class AuditService {
  static async log(params) {
    try {
      const sanitizedMeta = params.metadata ? { ...params.metadata } : undefined;
      if (sanitizedMeta) {
        delete sanitizedMeta.password;
        delete sanitizedMeta.oldPassword;
        delete sanitizedMeta.newPassword;
        delete sanitizedMeta.passwordHash;
        delete sanitizedMeta.token;
        delete sanitizedMeta.tokenHash;
        delete sanitizedMeta.rawToken;
        delete sanitizedMeta.authorization;
      }

      await AuditLog.create({
        userId: params.userId,
        action: params.action || params.event,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        ipAddress: params.ipAddress || 'unknown',
        userAgent: params.userAgent || 'unknown',
        metadata: sanitizedMeta,
      });
    } catch (err) {
      logger.warn('Failed to record security audit log entry:', { error: err.message });
    }
  }
}
