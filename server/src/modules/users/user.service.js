import { User } from './user.model.js';

export class UserService {
  static async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  }

  static async findById(id) {
    return User.findById(id).exec();
  }

  static async incrementFailedLogins(userId) {
    const user = await User.findById(userId);
    if (!user) return 0;
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
    }
    await user.save();
    return user.failedLoginAttempts;
  }

  static async resetFailedLogins(userId) {
    await User.findByIdAndUpdate(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });
  }
}
