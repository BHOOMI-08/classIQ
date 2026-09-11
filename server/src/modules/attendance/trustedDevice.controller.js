import { TrustedDeviceService } from './trustedDevice.service.js';
import { TrustedDevice } from './trustedDevice.model.js';
import { ApiResponse } from '../../utils/api-response.js';

export class TrustedDeviceController {
  static registerDevice = async (req, res, next) => {
    try {
      const { deviceId, platform, label } = req.body;
      const device = await TrustedDeviceService.registerOrUpdateDevice({
        userId: req.user._id,
        deviceId,
        userAgent: req.headers['user-agent'],
        platform,
        label,
      });
      return ApiResponse.success(res, 201, 'Device registered/updated successfully', { device });
    } catch (err) {
      next(err);
    }
  };

  static getUserDevices = async (req, res, next) => {
    try {
      const devices = await TrustedDevice.find({ userId: req.user._id }).sort({ lastSeenAt: -1 }).lean();
      return ApiResponse.success(res, 200, 'User devices retrieved', { devices });
    } catch (err) {
      next(err);
    }
  };
}
