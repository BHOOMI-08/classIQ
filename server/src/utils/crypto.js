import crypto from 'crypto';

export class CryptoUtils {
  static hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  static generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  static generateUUID() {
    return crypto.randomUUID();
  }
}
