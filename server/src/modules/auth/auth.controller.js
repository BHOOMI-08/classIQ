import { AuthService } from './auth.service.js';
import { DeviceParser } from '../../utils/device-parser.js';
import { ApiResponse } from '../../utils/api-response.js';
import {
  getRefreshTokenCookieOptions,
  getDeviceIdCookieOptions,
  getClearRefreshTokenCookieOptions,
} from '../../utils/cookie-options.js';

const setAuthCookies = (res, rawRefreshToken, deviceId) => {
  res.cookie('refreshToken', rawRefreshToken, getRefreshTokenCookieOptions());
  res.cookie('deviceId', deviceId, getDeviceIdCookieOptions());
};

export class AuthController {
  static registerStudent = async (req, res) => {
    const ipAddress = req.ip || '';
    const userAgent = req.get('user-agent') || '';
    const result = await AuthService.registerStudent(req.body, ipAddress, userAgent);
    return ApiResponse.success(
      res,
      201,
      'Student registered successfully. Please check your email to verify your account.',
      result
    );
  };

  static registerTeacher = async (req, res) => {
    const ipAddress = req.ip || '';
    const userAgent = req.get('user-agent') || '';
    const result = await AuthService.registerTeacher(req.body, ipAddress, userAgent);
    return ApiResponse.success(
      res,
      201,
      'Teacher registered successfully. Please check your email to verify your account.',
      result
    );
  };

  static login = async (req, res) => {
    const deviceInfo = DeviceParser.parse(req.get('user-agent'));
    const ipAddress = req.ip || '';
    const deviceIdCookie = req.cookies.deviceId;

    const result = await AuthService.login(req.body, deviceInfo, ipAddress, deviceIdCookie);

    setAuthCookies(res, result.rawRefreshToken, result.deviceId);

    return ApiResponse.success(res, 200, 'Login successful', {
      user: result.user,
      accessToken: result.accessToken,
    });
  };

  static refreshToken = async (req, res) => {
    const rawRefreshToken = req.cookies.refreshToken;
    if (!rawRefreshToken) {
      return ApiResponse.error(res, 401, 'Refresh token cookie missing');
    }

    const deviceInfo = DeviceParser.parse(req.get('user-agent'));
    const ipAddress = req.ip || '';

    const result = await AuthService.refreshTokenRotation(rawRefreshToken, deviceInfo, ipAddress);

    res.cookie('refreshToken', result.rawRefreshToken, getRefreshTokenCookieOptions());

    return ApiResponse.success(res, 200, 'Token refreshed successfully', {
      accessToken: result.accessToken,
    });
  };

  static logout = async (req, res) => {
    const rawRefreshToken = req.cookies.refreshToken;
    if (req.user) {
      await AuthService.logout(rawRefreshToken, req.user._id, req.sessionId, req.ip, req.get('user-agent'));
    }

    res.clearCookie('refreshToken', getClearRefreshTokenCookieOptions());
    return ApiResponse.success(res, 200, 'Logged out successfully');
  };

  static logoutAll = async (req, res) => {
    if (req.user) {
      await AuthService.logoutAll(req.user._id, req.ip, req.get('user-agent'));
    }
    res.clearCookie('refreshToken', getClearRefreshTokenCookieOptions());
    return ApiResponse.success(res, 200, 'Logged out from all devices successfully');
  };

  static getMe = async (req, res) => {
    return ApiResponse.success(res, 200, 'User profile retrieved', {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl,
        accountStatus: req.user.accountStatus,
        isEmailVerified: req.user.isEmailVerified,
      },
    });
  };

  static sendVerificationEmail = async (req, res) => {
    await AuthService.sendEmailVerification(req.user._id, req.ip, req.get('user-agent'));
    return ApiResponse.success(res, 200, 'Verification email sent');
  };

  static verifyEmail = async (req, res) => {
    await AuthService.verifyEmail(req.body.token, req.ip, req.get('user-agent'));
    return ApiResponse.success(res, 200, 'Email verified successfully');
  };

  static forgotPassword = async (req, res) => {
    await AuthService.forgotPassword(req.body.email, req.ip, req.get('user-agent'));
    return ApiResponse.success(
      res,
      200,
      'If the email exists in our system, a password reset link has been sent.'
    );
  };

  static resetPassword = async (req, res) => {
    const ipAddress = req.ip || '';
    const userAgent = req.get('user-agent') || '';
    await AuthService.resetPassword(req.body.token, req.body.password, ipAddress, userAgent);
    return ApiResponse.success(
      res,
      200,
      'Password has been reset successfully. Please log in with your new password.'
    );
  };

  static changePassword = async (req, res) => {
    const ipAddress = req.ip || '';
    const userAgent = req.get('user-agent') || '';
    await AuthService.changePassword(
      req.user._id,
      req.body.oldPassword,
      req.body.newPassword,
      req.sessionId || '',
      ipAddress,
      userAgent
    );
    return ApiResponse.success(res, 200, 'Password changed successfully');
  };
}
