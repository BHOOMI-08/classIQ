import { describe, it, expect } from '@jest/globals';
import { TokenService } from '../src/services/token.service.js';

describe('TokenService', () => {
  it('should generate and verify JWT access tokens', () => {
    const payload = { userId: 'user123', role: 'student', sessionId: 'sess123' };
    const token = TokenService.generateAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = TokenService.verifyAccessToken(token);
    expect(decoded.userId).toBe('user123');
    expect(decoded.role).toBe('student');
    expect(decoded.sessionId).toBe('sess123');
  });

  it('should generate random refresh token and hash it', () => {
    const payload = { userId: 'user123', sessionId: 'sess123', familyId: 'fam123' };
    const { rawToken, tokenHash, jwtToken } = TokenService.generateRefreshToken(payload);
    expect(rawToken).toHaveLength(64);
    expect(tokenHash).toHaveLength(64);
    expect(jwtToken).toBeDefined();

    const hashedAgain = TokenService.hashToken(rawToken);
    expect(hashedAgain).toBe(tokenHash);
  });
});
