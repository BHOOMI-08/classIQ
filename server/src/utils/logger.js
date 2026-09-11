import { env } from '../config/env.js';

class Logger {
  format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = { ...meta };

    // Redact sensitive keys
    const SENSITIVE_KEYS = [
      'password',
      'passwordHash',
      'token',
      'tokenHash',
      'refreshToken',
      'authorization',
      'qrToken',
      'signature',
      'nonce',
      'deviceFingerprint',
      'hmacSecret',
      'cookie',
    ];

    SENSITIVE_KEYS.forEach((key) => {
      delete sanitizedMeta[key];
    });

    if (env.NODE_ENV === 'production') {
      return JSON.stringify({ timestamp, level, message, ...sanitizedMeta });
    }
    const metaString = Object.keys(sanitizedMeta).length ? JSON.stringify(sanitizedMeta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`.trim();
  }

  info(message, meta) {
    if (env.NODE_ENV !== 'test') {
      console.log(this.format('info', message, meta));
    }
  }

  warn(message, meta) {
    if (env.NODE_ENV !== 'test') {
      console.warn(this.format('warn', message, meta));
    }
  }

  error(message, meta) {
    if (env.NODE_ENV !== 'test') {
      console.error(this.format('error', message, meta));
    }
  }
}

export const logger = new Logger();
