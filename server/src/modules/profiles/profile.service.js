import { User } from '../users/user.model.js';
import { StudentProfile } from './student-profile.model.js';
import { TeacherProfile } from './teacher-profile.model.js';
import { ApiError } from '../../utils/api-error.js';
import { storageService } from '../../services/storage/storage.service.js';
import { PasswordService } from '../../services/password.service.js';
import { SessionService } from '../sessions/session.service.js';
import { CryptoUtils } from '../../utils/crypto.js';
import { AUTH_CONSTANTS } from '../../constants/auth.constants.js';

export class ProfileService {
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    let profileDetails = null;
    if (user.role === 'student') {
      profileDetails = await StudentProfile.findOne({ userId });
    } else if (user.role === 'teacher') {
      profileDetails = await TeacherProfile.findOne({ userId });
    }

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      profile: profileDetails,
    };
  }

  static async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (data.name) {
      user.name = data.name;
      await user.save();
    }

    let profileDetails = null;
    if (user.role === 'student') {
      const allowedStudentFields = ['department', 'semester', 'section', 'bio'];
      const updateData = {};
      for (const field of allowedStudentFields) {
        if (data[field] !== undefined) updateData[field] = data[field];
      }
      profileDetails = await StudentProfile.findOneAndUpdate({ userId }, updateData, { new: true });
    } else if (user.role === 'teacher') {
      const allowedTeacherFields = ['department', 'designation', 'subjects', 'bio'];
      const updateData = {};
      for (const field of allowedTeacherFields) {
        if (data[field] !== undefined) updateData[field] = data[field];
      }
      profileDetails = await TeacherProfile.findOneAndUpdate({ userId }, updateData, { new: true });
    }

    return { user, profile: profileDetails };
  }

  static async uploadAvatar(userId, fileBuffer, originalName, mimeType) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const ext = originalName.split('.').pop() || 'png';
    const filename = `${userId}-${CryptoUtils.generateRandomToken(8)}.${ext}`;

    if (user.avatarUrl || user.avatarStorageKey) {
      await storageService.deleteAvatar(user.avatarStorageKey || user.avatarUrl);
    }

    const { url, key } = await storageService.uploadAvatar(fileBuffer, filename, mimeType);
    user.avatarUrl = url;
    user.avatarStorageKey = key;
    await user.save();

    return url;
  }

  static async removeAvatar(userId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (user.avatarUrl || user.avatarStorageKey) {
      await storageService.deleteAvatar(user.avatarStorageKey || user.avatarUrl);
      user.avatarUrl = '';
      user.avatarStorageKey = '';
      await user.save();
    }
  }

  static async deactivateAccount(userId, passwordConfirm) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw ApiError.notFound('User not found');

    const isValid = await PasswordService.comparePassword(passwordConfirm, user.passwordHash);
    if (!isValid) throw ApiError.badRequest('Invalid password confirmation');

    user.accountStatus = AUTH_CONSTANTS.ACCOUNT_STATUS.DEACTIVATED;
    await user.save();

    await SessionService.revokeAllUserSessions(userId, 'Account deactivated by user');
  }
}
