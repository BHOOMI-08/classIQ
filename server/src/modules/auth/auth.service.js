import mongoose from 'mongoose';
import { User } from '../users/user.model.js';
import { StudentProfile } from '../profiles/student-profile.model.js';
import { TeacherProfile } from '../profiles/teacher-profile.model.js';
import { RefreshToken } from '../sessions/refresh-token.model.js';
import { VerificationToken } from '../sessions/verification-token.model.js';
import { PasswordService } from '../../services/password.service.js';
import { TokenService } from '../../services/token.service.js';
import { EmailService } from '../../services/email.service.js';
import { SessionService } from '../sessions/session.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ApiError } from '../../utils/api-error.js';
import { CryptoUtils } from '../../utils/crypto.js';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';
import { AUTH_CONSTANTS } from '../../constants/auth.constants.js';
import { ROLES } from '../../constants/roles.js';

export class AuthService {
  static async registerStudent(dto, ipAddress, userAgent) {
    const existingUser = await User.findOne({ email: dto.email.toLowerCase() });
    if (existingUser) throw ApiError.badRequest('Email is already registered');

    const existingStudent = await StudentProfile.findOne({ studentId: dto.studentId });
    if (existingStudent) throw ApiError.badRequest('Student ID is already registered');

    const passwordHash = await PasswordService.hashPassword(dto.password);

    let user;
    let rawVerificationToken = '';

    try {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        const [createdUser] = await User.create(
          [
            {
              name: dto.name,
              email: dto.email.toLowerCase(),
              passwordHash,
              role: ROLES.STUDENT,
              accountStatus: AUTH_CONSTANTS.ACCOUNT_STATUS.PENDING_VERIFICATION,
            },
          ],
          { session }
        );
        user = createdUser;

        await StudentProfile.create(
          [
            {
              userId: user._id,
              studentId: dto.studentId,
              rollNumber: dto.rollNumber,
              department: dto.department,
              semester: dto.semester,
              section: dto.section,
              institution: dto.institution,
            },
          ],
          { session }
        );

        rawVerificationToken = CryptoUtils.generateRandomToken(32);
        const tokenHash = CryptoUtils.hashToken(rawVerificationToken);

        await VerificationToken.create(
          [
            {
              userId: user._id,
              type: 'email_verification',
              tokenHash,
              expiresAt: new Date(Date.now() + AUTH_CONSTANTS.VERIFICATION_TOKEN_TTL_MS),
            },
          ],
          { session }
        );

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } catch (txErr) {
      // Non-transaction fallback for standalone DB deployments
      user = await User.create({
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: ROLES.STUDENT,
        accountStatus: AUTH_CONSTANTS.ACCOUNT_STATUS.PENDING_VERIFICATION,
      });

      await StudentProfile.create({
        userId: user._id,
        studentId: dto.studentId,
        rollNumber: dto.rollNumber,
        department: dto.department,
        semester: dto.semester,
        section: dto.section,
        institution: dto.institution,
      });

      rawVerificationToken = CryptoUtils.generateRandomToken(32);
      const tokenHash = CryptoUtils.hashToken(rawVerificationToken);

      await VerificationToken.create({
        userId: user._id,
        type: 'email_verification',
        tokenHash,
        expiresAt: new Date(Date.now() + AUTH_CONSTANTS.VERIFICATION_TOKEN_TTL_MS),
      });
    }

    await AuditService.log({
      userId: user._id.toString(),
      action: AUDIT_EVENTS.USER_REGISTERED,
      ipAddress,
      userAgent,
      metadata: { role: ROLES.STUDENT },
    });

    await EmailService.sendVerificationEmail(user.email, rawVerificationToken);

    return { userId: user._id, email: user.email };
  }

  static async registerTeacher(dto, ipAddress, userAgent) {
    const existingUser = await User.findOne({ email: dto.email.toLowerCase() });
    if (existingUser) throw ApiError.badRequest('Email is already registered');

    const existingTeacher = await TeacherProfile.findOne({
      employeeId: dto.employeeId,
      institution: dto.institution,
    });
    if (existingTeacher) throw ApiError.badRequest('Employee ID is already registered for this institution');

    const passwordHash = await PasswordService.hashPassword(dto.password);

    let user;
    let rawVerificationToken = '';

    try {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        const [createdUser] = await User.create(
          [
            {
              name: dto.name,
              email: dto.email.toLowerCase(),
              passwordHash,
              role: ROLES.TEACHER,
              accountStatus: AUTH_CONSTANTS.ACCOUNT_STATUS.PENDING_VERIFICATION,
            },
          ],
          { session }
        );
        user = createdUser;

        await TeacherProfile.create(
          [
            {
              userId: user._id,
              employeeId: dto.employeeId,
              department: dto.department,
              designation: dto.designation,
              subjects: dto.subjects || [],
              institution: dto.institution,
            },
          ],
          { session }
        );

        rawVerificationToken = CryptoUtils.generateRandomToken(32);
        const tokenHash = CryptoUtils.hashToken(rawVerificationToken);

        await VerificationToken.create(
          [
            {
              userId: user._id,
              type: 'email_verification',
              tokenHash,
              expiresAt: new Date(Date.now() + AUTH_CONSTANTS.VERIFICATION_TOKEN_TTL_MS),
            },
          ],
          { session }
        );

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } catch (txErr) {
      user = await User.create({
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: ROLES.TEACHER,
        accountStatus: AUTH_CONSTANTS.ACCOUNT_STATUS.PENDING_VERIFICATION,
      });

      await TeacherProfile.create({
        userId: user._id,
        employeeId: dto.employeeId,
        department: dto.department,
        designation: dto.designation,
        subjects: dto.subjects || [],
        institution: dto.institution,
      });

      rawVerificationToken = CryptoUtils.generateRandomToken(32);
      const tokenHash = CryptoUtils.hashToken(rawVerificationToken);

      await VerificationToken.create({
        userId: user._id,
        type: 'email_verification',
        tokenHash,
        expiresAt: new Date(Date.now() + AUTH_CONSTANTS.VERIFICATION_TOKEN_TTL_MS),
      });
    }

    await AuditService.log({
      userId: user._id.toString(),
      action: AUDIT_EVENTS.USER_REGISTERED,
      ipAddress,
      userAgent,
      metadata: { role: ROLES.TEACHER },
    });

    await EmailService.sendVerificationEmail(user.email, rawVerificationToken);

    return { userId: user._id, email: user.email };
  }

  static async login(dto, deviceInfo, ipAddress, deviceIdCookie) {
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select('+passwordHash');
    
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw ApiError.forbidden(`Account locked due to repeated failed logins. Try again in ${minutesLeft} minutes.`);
    }

    if (
      user.accountStatus === AUTH_CONSTANTS.ACCOUNT_STATUS.SUSPENDED ||
      user.accountStatus === AUTH_CONSTANTS.ACCOUNT_STATUS.DEACTIVATED
    ) {
      throw ApiError.forbidden(`Account is ${user.accountStatus}. Please contact support.`);
    }

    const isPasswordValid = await PasswordService.comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + AUTH_CONSTANTS.LOCK_TIME_MS);
        await AuditService.log({
          userId: user._id.toString(),
          action: AUDIT_EVENTS.ACCOUNT_LOCKED,
          ipAddress,
          userAgent: deviceInfo.userAgent,
        });
      } else {
        await AuditService.log({
          userId: user._id.toString(),
          action: AUDIT_EVENTS.LOGIN_FAILED,
          ipAddress,
          userAgent: deviceInfo.userAgent,
        });
      }
      await user.save();
      throw ApiError.unauthorized('Invalid email or password');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const { session: deviceSession, deviceId } = await SessionService.findOrCreateDeviceSession(
      user._id.toString(),
      deviceIdCookie,
      deviceInfo,
      ipAddress
    );

    const familyId = CryptoUtils.generateUUID();
    const accessToken = TokenService.generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      sessionId: deviceSession._id.toString(),
    });

    const { rawToken, tokenHash } = TokenService.generateRefreshToken({
      userId: user._id.toString(),
      sessionId: deviceSession._id.toString(),
      familyId,
    });

    await RefreshToken.create({
      userId: user._id,
      sessionId: deviceSession._id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_TTL_MS),
    });

    await AuditService.log({
      userId: user._id.toString(),
      action: AUDIT_EVENTS.LOGIN_SUCCESS,
      ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      rawRefreshToken: rawToken,
      deviceId,
    };
  }

  static async refreshTokenRotation(rawRefreshToken, deviceInfo, ipAddress) {
    const tokenHash = TokenService.hashToken(rawRefreshToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      await RefreshToken.updateMany(
        { familyId: storedToken.familyId, revokedAt: null },
        { revokedAt: new Date(), revocationReason: 'Token reuse theft alert' }
      );

      await SessionService.revokeSession(storedToken.sessionId.toString(), storedToken.userId.toString());

      await AuditService.log({
        userId: storedToken.userId.toString(),
        action: AUDIT_EVENTS.TOKEN_REUSE_DETECTED,
        ipAddress,
        userAgent: deviceInfo.userAgent,
        metadata: { familyId: storedToken.familyId },
      });

      throw ApiError.unauthorized('Security alert: Refresh token reuse detected. All sessions revoked.');
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      throw ApiError.unauthorized('Refresh token expired');
    }

    const user = await User.findById(storedToken.userId);
    if (
      !user ||
      user.accountStatus === AUTH_CONSTANTS.ACCOUNT_STATUS.SUSPENDED ||
      user.accountStatus === AUTH_CONSTANTS.ACCOUNT_STATUS.DEACTIVATED
    ) {
      throw ApiError.unauthorized('User account disabled');
    }

    const newAccessToken = TokenService.generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      sessionId: storedToken.sessionId.toString(),
    });

    const { rawToken: newRawRefreshToken, tokenHash: newHash } = TokenService.generateRefreshToken({
      userId: user._id.toString(),
      sessionId: storedToken.sessionId.toString(),
      familyId: storedToken.familyId,
    });

    const newTokenDoc = await RefreshToken.create({
      userId: user._id,
      sessionId: storedToken.sessionId,
      tokenHash: newHash,
      familyId: storedToken.familyId,
      expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_TTL_MS),
    });

    storedToken.revokedAt = new Date();
    storedToken.replacedByTokenId = newTokenDoc._id;
    await storedToken.save();

    await AuditService.log({
      userId: user._id.toString(),
      action: AUDIT_EVENTS.TOKEN_REFRESHED,
      ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    return {
      accessToken: newAccessToken,
      rawRefreshToken: newRawRefreshToken,
    };
  }

  static async logout(rawRefreshToken, userId, sessionId, ipAddress = '', userAgent = '') {
    if (rawRefreshToken) {
      const tokenHash = TokenService.hashToken(rawRefreshToken);
      await RefreshToken.findOneAndUpdate(
        { tokenHash, revokedAt: null },
        { revokedAt: new Date(), revocationReason: 'User logout' }
      );
    }
    if (sessionId) {
      await SessionService.revokeSession(sessionId, userId);
    }
    await AuditService.log({
      userId: userId.toString(),
      action: AUDIT_EVENTS.LOGOUT,
      ipAddress,
      userAgent,
    });
  }

  static async logoutAll(userId, ipAddress = '', userAgent = '') {
    await SessionService.revokeAllUserSessions(userId, 'User logout all requested');
    await AuditService.log({
      userId: userId.toString(),
      action: AUDIT_EVENTS.LOGOUT_ALL,
      ipAddress,
      userAgent,
    });
  }

  static async sendEmailVerification(userId, ipAddress = '', userAgent = '') {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.isEmailVerified) throw ApiError.badRequest('Email is already verified');

    await VerificationToken.updateMany(
      { userId: user._id, type: 'email_verification', usedAt: null },
      { usedAt: new Date() }
    );

    const rawToken = CryptoUtils.generateRandomToken(32);
    const tokenHash = CryptoUtils.hashToken(rawToken);

    await VerificationToken.create({
      userId: user._id,
      type: 'email_verification',
      tokenHash,
      expiresAt: new Date(Date.now() + AUTH_CONSTANTS.VERIFICATION_TOKEN_TTL_MS),
    });

    await AuditService.log({
      userId: user._id.toString(),
      action: AUDIT_EVENTS.EMAIL_VERIFICATION_SENT,
      ipAddress,
      userAgent,
    });

    await EmailService.sendVerificationEmail(user.email, rawToken);
  }

  static async verifyEmail(rawToken, ipAddress = '', userAgent = '') {
    const tokenHash = CryptoUtils.hashToken(rawToken);
    const vToken = await VerificationToken.findOne({
      tokenHash,
      type: 'email_verification',
      usedAt: null,
    });

    if (!vToken || vToken.expiresAt.getTime() < Date.now()) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    vToken.usedAt = new Date();
    await vToken.save();

    const user = await User.findById(vToken.userId);
    if (user) {
      user.isEmailVerified = true;
      if (user.accountStatus === AUTH_CONSTANTS.ACCOUNT_STATUS.PENDING_VERIFICATION) {
        user.accountStatus = AUTH_CONSTANTS.ACCOUNT_STATUS.ACTIVE;
      }
      await user.save();

      await AuditService.log({
        userId: user._id.toString(),
        action: AUDIT_EVENTS.EMAIL_VERIFIED,
        ipAddress,
        userAgent,
      });
    }
  }

  static async forgotPassword(email, ipAddress = '', userAgent = '') {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return;
    }

    await VerificationToken.updateMany(
      { userId: user._id, type: 'password_reset', usedAt: null },
      { usedAt: new Date() }
    );

    const rawToken = CryptoUtils.generateRandomToken(32);
    const tokenHash = CryptoUtils.hashToken(rawToken);

    await VerificationToken.create({
      userId: user._id,
      type: 'password_reset',
      tokenHash,
      expiresAt: new Date(Date.now() + AUTH_CONSTANTS.RESET_TOKEN_TTL_MS),
    });

    await AuditService.log({
      userId: user._id.toString(),
      action: AUDIT_EVENTS.PASSWORD_RESET_REQUESTED,
      ipAddress,
      userAgent,
    });

    await EmailService.sendPasswordResetEmail(user.email, rawToken);
  }

  static async resetPassword(rawToken, newPassword, ipAddress, userAgent) {
    const tokenHash = CryptoUtils.hashToken(rawToken);
    const vToken = await VerificationToken.findOne({
      tokenHash,
      type: 'password_reset',
      usedAt: null,
    });

    if (!vToken || vToken.expiresAt.getTime() < Date.now()) {
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    vToken.usedAt = new Date();
    await vToken.save();

    const user = await User.findById(vToken.userId);
    if (!user) throw ApiError.notFound('User not found');

    user.passwordHash = await PasswordService.hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    await SessionService.revokeAllUserSessions(user._id.toString(), 'Password reset triggered');

    await AuditService.log({
      userId: user._id.toString(),
      action: AUDIT_EVENTS.PASSWORD_RESET,
      ipAddress,
      userAgent,
    });

    await EmailService.sendSecurityAlert(
      user.email,
      'Password Reset Confirmation',
      'Your password was reset successfully. All existing active sessions were logged out.'
    );
  }

  static async changePassword(userId, oldPassword, newPassword, currentSessionId, ipAddress, userAgent) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw ApiError.notFound('User not found');

    const isValid = await PasswordService.comparePassword(oldPassword, user.passwordHash);
    if (!isValid) throw ApiError.badRequest('Incorrect old password');

    const isSame = await PasswordService.comparePassword(newPassword, user.passwordHash);
    if (isSame) throw ApiError.badRequest('New password cannot be identical to the current password');

    user.passwordHash = await PasswordService.hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    await SessionService.revokeAllOtherSessions(currentSessionId, userId);

    await AuditService.log({
      userId: userId.toString(),
      action: AUDIT_EVENTS.PASSWORD_CHANGED,
      ipAddress,
      userAgent,
    });

    await EmailService.sendSecurityAlert(
      user.email,
      'Password Changed Alert',
      'Your account password was changed. All other device sessions have been revoked.'
    );
  }
}
