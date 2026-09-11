import { CryptoService } from '../../services/crypto.service.js';
import { PRESENCE_CHALLENGE_TYPES } from './attendance.constants.js';

export class PresenceChallengeService {
  /**
   * Create an in-memory or transient presence challenge object for step-up verification.
   */
  static createChallenge({ sessionId, studentId, type = PRESENCE_CHALLENGE_TYPES.CODE_MATCH, expiresInSeconds = 60 }) {
    const challengeId = `ch_${CryptoService.generateNonce(8)}`;

    let promptData = {};
    let rawAnswer = '';

    if (type === PRESENCE_CHALLENGE_TYPES.CODE_MATCH) {
      rawAnswer = Math.floor(1000 + Math.random() * 9000).toString();
      promptData = { code: rawAnswer, message: `Enter code ${rawAnswer} to confirm presence` };
    } else if (type === PRESENCE_CHALLENGE_TYPES.TAP_CONFIRMATION) {
      rawAnswer = 'TAP_CONFIRMED';
      promptData = { buttonLabel: 'Tap to Confirm Attendance' };
    } else {
      rawAnswer = 'MATCH';
      promptData = { message: 'Confirm your active presence' };
    }

    const answerHash = CryptoService.hashString(rawAnswer.toUpperCase().trim());
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      challengeId,
      sessionId: String(sessionId),
      studentId: String(studentId),
      type,
      promptData,
      answerHash,
      expiresAt,
      attempts: 0,
      maxAttempts: 3,
      status: 'pending',
    };
  }

  /**
   * Verify an answer against a challenge object.
   */
  static verifyChallengeResponse(challenge, submittedAnswer) {
    if (!challenge) {
      return { passed: false, reason: 'CHALLENGE_NOT_FOUND' };
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      return { passed: false, reason: 'CHALLENGE_EXPIRED' };
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      return { passed: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    challenge.attempts += 1;

    const submittedHash = CryptoService.hashString(String(submittedAnswer || '').toUpperCase().trim());
    const match = CryptoService.timingSafeEqual(submittedHash, challenge.answerHash);

    if (match) {
      challenge.status = 'passed';
      return { passed: true };
    } else {
      if (challenge.attempts >= challenge.maxAttempts) {
        challenge.status = 'failed';
      }
      return { passed: false, reason: 'INVALID_ANSWER' };
    }
  }
}
