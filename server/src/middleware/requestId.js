import crypto from 'crypto';

export const requestIdMiddleware = (req, res, next) => {
  const existingId = req.headers['x-request-id'];
  const requestId = existingId && typeof existingId === 'string' && existingId.length <= 100
    ? existingId
    : crypto.randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
