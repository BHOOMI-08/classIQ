import { ProfileService } from './profile.service.js';
import { ApiResponse } from '../../utils/api-response.js';
import { ApiError } from '../../utils/api-error.js';
import { AuditService } from '../audit/audit.service.js';

export class ProfileController {
  static getProfile = async (req, res) => {
    const data = await ProfileService.getProfile(req.user._id);
    return ApiResponse.success(res, 200, 'Profile retrieved', data);
  };

  static updateProfile = async (req, res) => {
    const data = await ProfileService.updateProfile(req.user._id, req.body);

    await AuditService.log({
      userId: req.user._id,
      action: 'PROFILE_UPDATED',
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || '',
    });

    return ApiResponse.success(res, 200, 'Profile updated successfully', data);
  };

  static uploadAvatar = async (req, res) => {
    if (!req.file) {
      throw ApiError.badRequest('No image file provided');
    }

    const avatarUrl = await ProfileService.uploadAvatar(
      req.user._id,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    await AuditService.log({
      userId: req.user._id,
      action: 'AVATAR_UPDATED',
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || '',
    });

    return ApiResponse.success(res, 200, 'Avatar uploaded successfully', { avatarUrl });
  };

  static deleteAvatar = async (req, res) => {
    await ProfileService.removeAvatar(req.user._id);
    return ApiResponse.success(res, 200, 'Avatar removed successfully');
  };

  static deactivateAccount = async (req, res) => {
    await ProfileService.deactivateAccount(req.user._id, req.body.password);

    await AuditService.log({
      userId: req.user._id,
      action: 'ACCOUNT_DEACTIVATED',
      ipAddress: req.ip || '',
      userAgent: req.get('user-agent') || '',
    });

    res.clearCookie('refreshToken');
    res.clearCookie('deviceId');
    return ApiResponse.success(res, 200, 'Account deactivated successfully');
  };
}
