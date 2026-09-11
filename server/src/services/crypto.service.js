import crypto from 'crypto';
import { ATTENDANCE_CONFIG } from '../config/attendance.config.js';

export class CryptoService {
  /**
   * Produce a canonical JSON string for token signing to guarantee key order consistency.
   */
  static serializeCanonicalPayload(payload) {
    const canonicalObject = {
      version: payload.version ?? 1,
      tokenId: String(payload.tokenId),
      sessionId: String(payload.sessionId),
      classroomId: String(payload.classroomId),
      teacherId: String(payload.teacherId),
      rotation: Number(payload.rotation),
      issuedAt: Number(payload.issuedAt),
      expiresAt: Number(payload.expiresAt),
      nonce: String(payload.nonce),
    };
    return JSON.stringify(canonicalObject);
  }

  /**
   * Sign a canonical payload using HMAC-SHA256 with the server HMAC secret.
   */
  static signPayload(canonicalString, secret = ATTENDANCE_CONFIG.HMAC_SECRET) {
    return crypto
      .createHmac('sha256', secret)
      .update(canonicalString)
      .digest('base64url');
  }

  /**
   * Safely compare two strings in constant time to prevent timing attacks.
   */
  static timingSafeEqual(strA, strB) {
    if (typeof strA !== 'string' || typeof strB !== 'string') {
      return false;
    }
    const bufA = Buffer.from(strA, 'utf8');
    const bufB = Buffer.from(strB, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Create a signed QR token string: base64url(canonicalJSON) + '.' + base64url(signature)
   */
  static generateQrToken(payload, secret = ATTENDANCE_CONFIG.HMAC_SECRET) {
    const canonicalString = this.serializeCanonicalPayload(payload);
    const encodedPayload = Buffer.from(canonicalString, 'utf8').toString('base64url');
    const signature = this.signPayload(canonicalString, secret);
    return `${encodedPayload}.${signature}`;
  }

  /**
   * Verify and decode a signed QR token string.
   */
  static verifyQrToken(tokenString, secret = ATTENDANCE_CONFIG.HMAC_SECRET) {
    if (!tokenString || typeof tokenString !== 'string') {
      return { valid: false, reason: 'INVALID_FORMAT' };
    }

    const parts = tokenString.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'MALFORMED_TOKEN' };
    }

    const [encodedPayload, providedSignature] = parts;

    try {
      const canonicalString = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const payload = JSON.parse(canonicalString);

      // Re-serialize payload to canonical format to enforce structural integrity
      const reCanonical = this.serializeCanonicalPayload(payload);
      const expectedSignature = this.signPayload(reCanonical, secret);

      const isSignatureValid = this.timingSafeEqual(providedSignature, expectedSignature);
      if (!isSignatureValid) {
        return { valid: false, reason: 'INVALID_SIGNATURE' };
      }

      return { valid: true, payload };
    } catch (err) {
      return { valid: false, reason: 'DECODE_ERROR', error: err.message };
    }
  }

  /**
   * Generate a random hex nonce.
   */
  static generateNonce(bytes = ATTENDANCE_CONFIG.NONCE_BYTES) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Hash a value using SHA-256 (e.g. for nonces, IP addresses, answer hashes).
   */
  static hashString(value) {
    if (!value) return '';
    return crypto.createHash('sha256').update(String(value)).digest('hex');
  }
}
