import { ApiError } from '../utils/api-error.js';

export const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Role '${req.user.role}' is not authorized to perform this operation`)
      );
    }

    next();
  };
};

export const verifyOwnershipOrAdmin = (resourceUserId, currentUserId, currentUserRole) => {
  if (currentUserRole === 'admin') return true;
  return resourceUserId.toString() === currentUserId.toString();
};
