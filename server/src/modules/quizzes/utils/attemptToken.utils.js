import crypto from 'crypto';

/**
 * Generate a cryptographically random attempt token.
 * Returns { plainToken, hashedToken }
 * Only hashedToken is stored in the database.
 */
export function generateAttemptToken() {
  const plainToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
  return { plainToken, hashedToken };
}

/**
 * Hash a plain attempt token for comparison.
 */
export function hashAttemptToken(plainToken) {
  return crypto.createHash('sha256').update(plainToken).digest('hex');
}

/**
 * Generate a cryptographically secure submission receipt code.
 */
export function generateReceiptCode() {
  return 'QZ-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}
