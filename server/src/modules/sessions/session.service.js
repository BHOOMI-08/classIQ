import { DeviceSession } from './device-session.model.js';
import { RefreshToken } from './refresh-token.model.js';
import { CryptoUtils } from '../../utils/crypto.js';
import { AUTH_CONSTANTS } from '../../constants/auth.constants.js';

export class SessionService {
  static async findOrCreateDeviceSession(userId, deviceIdCookie, deviceInfo, ipAddress) {
    const deviceId = deviceIdCookie || CryptoUtils.generateUUID();
    const expiresAt = new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_TTL_MS);
    const validIp = ipAddress || '127.0.0.1';

    let session = await DeviceSession.findOne({
      userId,
      deviceId,
      revokedAt: null,
    });

    if (session) {
      session.lastActiveAt = new Date();
      session.ipAddress = validIp;
      session.userAgent = deviceInfo.userAgent || 'unknown';
      session.expiresAt = expiresAt;
      await session.save();
    } else {
      session = await DeviceSession.create({
        userId,
        deviceId,
        deviceType: deviceInfo.deviceType || 'desktop',
        browser: deviceInfo.browser || 'unknown',
        operatingSystem: deviceInfo.operatingSystem || 'unknown',
        userAgent: deviceInfo.userAgent || 'unknown',
        ipAddress: validIp,
        lastActiveAt: new Date(),
        expiresAt,
      });
    }

    return { session, deviceId };
  }

  static async revokeSession(sessionId, userId) {
    const session = await DeviceSession.findOne({ _id: sessionId, userId });
    if (!session) return false;

    session.revokedAt = new Date();
    session.revocationReason = 'Session revoked by user';
    await session.save();

    await RefreshToken.updateMany(
      { sessionId: session._id, revokedAt: null },
      { revokedAt: new Date(), revocationReason: 'Session revoked by user' }
    );

    return true;
  }

  static async revokeAllOtherSessions(currentSessionId, userId) {
    const res = await DeviceSession.updateMany(
      { userId, _id: { $ne: currentSessionId }, revokedAt: null },
      { revokedAt: new Date(), revocationReason: 'All other sessions revoked' }
    );

    await RefreshToken.updateMany(
      { userId, sessionId: { $ne: currentSessionId }, revokedAt: null },
      { revokedAt: new Date(), revocationReason: 'All other sessions revoked' }
    );

    return res.modifiedCount;
  }

  static async revokeAllUserSessions(userId, reason = 'User requested revocation') {
    await DeviceSession.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date(), revocationReason: reason }
    );
    await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date(), revocationReason: reason }
    );
  }

  static async getUserSessions(userId, currentSessionId) {
    const sessions = await DeviceSession.find({ userId, revokedAt: null })
      .sort({ lastActiveAt: -1 })
      .lean();

    return sessions.map((s) => ({
      id: s._id.toString(),
      deviceId: s.deviceId,
      deviceType: s.deviceType,
      browser: s.browser,
      operatingSystem: s.operatingSystem,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt,
      isCurrentSession: s._id.toString() === (currentSessionId ? currentSessionId.toString() : ''),
    }));
  }
}
