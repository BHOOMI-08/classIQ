import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { CryptoUtils } from '../utils/crypto.js';

export class TokenService {
  static generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
  }

  static generateRefreshToken(payload) {
    const rawToken = CryptoUtils.generateRandomToken(32);
    const tokenHash = CryptoUtils.hashToken(rawToken);

    const jwtToken = jwt.sign(
      { ...payload, tokenHash },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return { rawToken, tokenHash, jwtToken };
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  }

  static hashToken(rawToken) {
    return CryptoUtils.hashToken(rawToken);
  }
}
