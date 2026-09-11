import { ApiError } from '../utils/api-error.js';
import { TokenService } from '../services/token.service.js';
import { User } from '../modules/users/user.model.js';
import { DeviceSession } from '../modules/sessions/device-session.model.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = TokenService.verifyAccessToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired access token');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (
      user.accountStatus === AUTH_CONSTANTS.ACCOUNT_STATUS.SUSPENDED ||
      user.accountStatus === AUTH_CONSTANTS.ACCOUNT_STATUS.DEACTIVATED
    ) {
      throw ApiError.forbidden(`Account is ${user.accountStatus}`);
    }

    // Check if password was changed after token issuance
    const tokenIssuedAt = payload.iat ? payload.iat * 1000 : 0;
    if (user.passwordChangedAt && tokenIssuedAt < user.passwordChangedAt.getTime()) {
      throw ApiError.unauthorized('Password changed recently. Please log in again.');
    }

    // Verify device session state
    if (payload.sessionId) {
      const session = await DeviceSession.findById(payload.sessionId);
      if (!session || session.revokedAt) {
        throw ApiError.unauthorized('Device session has been revoked');
      }
      req.sessionId = payload.sessionId;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
