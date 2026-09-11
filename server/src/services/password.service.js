import bcrypt from 'bcryptjs';

export class PasswordService {
  static SALT_ROUNDS = 12;

  static async hashPassword(plainText) {
    return bcrypt.hash(plainText, this.SALT_ROUNDS);
  }

  static async comparePassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  }
}
