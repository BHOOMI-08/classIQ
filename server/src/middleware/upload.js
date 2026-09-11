import multer from 'multer';
import { ApiError } from '../utils/api-error.js';

const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        ApiError.badRequest('Invalid image format. Only JPEG, PNG, and WebP images are allowed.')
      );
    }
    cb(null, true);
  },
});
