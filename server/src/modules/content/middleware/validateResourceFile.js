import multer from 'multer';
import { ApiError } from '../../../utils/api-error.js';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

export const uploadResourceFile = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.match(/\.(pdf|docx|txt|md)$/i)) {
      return cb(
        ApiError.badRequest('Invalid file format. Only PDF, DOCX, TXT, and Markdown files are supported.')
      );
    }
    cb(null, true);
  },
});
