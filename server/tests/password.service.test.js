import { describe, it, expect } from '@jest/globals';
import { PasswordService } from '../src/services/password.service.js';

describe('PasswordService', () => {
  it('should correctly hash and compare valid passwords', async () => {
    const plain = 'StrongPass123!';
    const hash = await PasswordService.hashPassword(plain);
    expect(hash).not.toBe(plain);
    
    const isValid = await PasswordService.comparePassword(plain, hash);
    expect(isValid).toBe(true);

    const isWrong = await PasswordService.comparePassword('WrongPassword123!', hash);
    expect(isWrong).toBe(false);
  });
});
