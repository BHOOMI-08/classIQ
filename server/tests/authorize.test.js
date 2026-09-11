import { jest, describe, it, expect } from '@jest/globals';
import { authorize, verifyOwnershipOrAdmin } from '../src/middleware/authorize.js';
import { ROLES } from '../src/constants/roles.js';

describe('Authorization Middleware & Helper Tests', () => {
  it('should allow user with authorized role', () => {
    const req = { user: { role: ROLES.STUDENT } };
    const next = jest.fn();
    const middleware = authorize(ROLES.STUDENT, ROLES.TEACHER);

    middleware(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should block user with unauthorized role', () => {
    const req = { user: { role: ROLES.STUDENT } };
    const next = jest.fn();
    const middleware = authorize(ROLES.TEACHER, ROLES.ADMIN);

    middleware(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('should verify ownership correctly', () => {
    const userId = 'user_abc';
    expect(verifyOwnershipOrAdmin(userId, 'user_abc', ROLES.STUDENT)).toBe(true);
    expect(verifyOwnershipOrAdmin(userId, 'user_xyz', ROLES.STUDENT)).toBe(false);
    expect(verifyOwnershipOrAdmin(userId, 'user_xyz', ROLES.ADMIN)).toBe(true);
  });
});
