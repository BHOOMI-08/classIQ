import multer from 'multer';
import { ApiError } from '../../../utils/api-error.js';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'application/zip',
];

export const uploadSubmissionFiles = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file limit
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.match(/\.(pdf|docx|txt|md|jpg|png|zip)$/i)) {
      return cb(
        ApiError.badRequest('Invalid file format. Only PDF, DOCX, TXT, MD, Images, and ZIP files are allowed.')
      );
    }
    cb(null, true);
  },
});
