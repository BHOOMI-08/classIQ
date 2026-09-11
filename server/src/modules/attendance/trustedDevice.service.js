import { TrustedDevice } from './trustedDevice.model.js';
import { TRUST_STATUS, SUSPICION_SIGNALS } from './attendance.constants.js';
import { CryptoService } from '../../services/crypto.service.js';

export class TrustedDeviceService {
  /**
   * Normalize device components and produce a deterministic SHA-256 hash.
   */
  static generateFingerprintHash({ deviceId, userAgent = '', platform = '', screenResolution = '' }) {
    const rawString = `${deviceId}:${userAgent.toLowerCase().trim()}:${platform.toLowerCase()}:${screenResolution}`;
    return CryptoService.hashString(rawString);
  }

  /**
   * Evaluate device risk for a given user and device payload.
   */
  static async evaluateDevice({ userId, deviceId, userAgent, platform, screenResolution }) {
    const fingerprintHash = this.generateFingerprintHash({ deviceId, userAgent, platform, screenResolution });

    let trustedDevice = await TrustedDevice.findOne({ userId, deviceId });
    const signals = [];

    if (!trustedDevice) {
      signals.push({ code: SUSPICION_SIGNALS.NEW_DEVICE, weight: 10 });
      return {
        isRecognized: false,
        trustStatus: TRUST_STATUS.UNVERIFIED,
        trustedDevice: null,
        signals,
        fingerprintHash,
      };
    }

    // Check for revoked device
    if (trustedDevice.trustStatus === TRUST_STATUS.REVOKED) {
      signals.push({ code: SUSPICION_SIGNALS.DEVICE_SESSION_MISMATCH, weight: 50 });
      return {
        isRecognized: false,
        trustStatus: TRUST_STATUS.REVOKED,
        trustedDevice,
        signals,
        fingerprintHash,
      };
    }

    // Update last seen timestamp
    trustedDevice.lastSeenAt = new Date();
    await trustedDevice.save();

    // Check for multiple student accounts using the same fingerprint hash in short window
    const recentOtherUsersCount = await TrustedDevice.countDocuments({
      deviceFingerprintHash: fingerprintHash,
      userId: { $ne: userId },
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recentOtherUsersCount > 0) {
      signals.push({
        code: SUSPICION_SIGNALS.MULTIPLE_ACCOUNTS_SAME_DEVICE,
        weight: 35,
        details: { otherAccountsCount: recentOtherUsersCount },
      });
    }

    return {
      isRecognized: trustedDevice.trustStatus === TRUST_STATUS.TRUSTED,
      trustStatus: trustedDevice.trustStatus,
      trustedDevice,
      signals,
      fingerprintHash,
    };
  }

  /**
   * Register or upgrade device trust status.
   */
  static async registerOrUpdateDevice({ userId, deviceId, userAgent, platform, label }) {
    const fingerprintHash = this.generateFingerprintHash({ deviceId, userAgent, platform });

    let trustedDevice = await TrustedDevice.findOne({ userId, deviceId });

    if (!trustedDevice) {
      trustedDevice = await TrustedDevice.create({
        userId,
        deviceId,
        deviceFingerprintHash: fingerprintHash,
        label: label || `${platform || 'Device'} (${browserFromUA(userAgent)})`,
        platform: platform || 'web',
        browser: browserFromUA(userAgent),
        trustStatus: TRUST_STATUS.TRUSTED,
        trustedAt: new Date(),
        lastSeenAt: new Date(),
      });
    } else {
      trustedDevice.lastSeenAt = new Date();
      if (trustedDevice.trustStatus === TRUST_STATUS.UNVERIFIED) {
        trustedDevice.trustStatus = TRUST_STATUS.TRUSTED;
      }
      await trustedDevice.save();
    }

    return trustedDevice;
  }
}

function browserFromUA(ua = '') {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
}
