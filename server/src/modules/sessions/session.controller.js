import { SessionService } from './session.service.js';
import { ApiResponse } from '../../utils/api-response.js';
import { ApiError } from '../../utils/api-error.js';

export class SessionController {
  static getActiveSessions = async (req, res) => {
    const sessions = await SessionService.getUserSessions(req.user._id, req.sessionId);
    return ApiResponse.success(res, 200, 'Active sessions retrieved', sessions);
  };

  static revokeSession = async (req, res) => {
    const { sessionId } = req.params;
    const success = await SessionService.revokeSession(sessionId, req.user._id);
    if (!success) {
      throw ApiError.notFound('Session not found or already revoked');
    }
    return ApiResponse.success(res, 200, 'Session revoked successfully');
  };

  static revokeOtherSessions = async (req, res) => {
    if (!req.sessionId) {
      throw ApiError.badRequest('Current session context missing');
    }
    const count = await SessionService.revokeAllOtherSessions(req.sessionId, req.user._id);
    return ApiResponse.success(res, 200, `Revoked ${count} other active sessions`);
  };
}
