import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { env } from '../config/env.js';
import { User } from '../modules/users/user.model.js';
import { logger } from '../utils/logger.js';

export const authenticateSocket = async (socket, next) => {
  try {
    let token = null;

    // 1. Try to extract token from handshake headers cookie
    if (socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      token = cookies.accessToken || cookies.jwt;
    }

    // 2. Fallback to auth header or query token
    if (!token && socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token.replace(/^Bearer\s+/, '');
    }

    if (!token && socket.handshake.query && socket.handshake.query.token) {
      token = socket.handshake.query.token;
    }

    if (!token) {
      return next(new Error('SOCKET_UNAUTHORIZED: Authentication token missing'));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId || decoded.id).select('-passwordHash').lean();

    if (!user || !user.isActive) {
      return next(new Error('SOCKET_UNAUTHORIZED: Invalid or deactivated user account'));
    }

    socket.data.user = user;
    next();
  } catch (err) {
    logger.warn('Socket authentication failed:', { error: err.message });
    return next(new Error('SOCKET_UNAUTHORIZED: Authentication failed'));
  }
};
