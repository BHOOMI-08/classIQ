import fs from 'fs';
import path from 'path';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class LocalStorageProvider {
  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR, 'avatars');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(fileBuffer, filename, _mimeType) {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.uploadDir, safeFilename);

    await fs.promises.writeFile(filePath, fileBuffer);
    return {
      url: `/uploads/avatars/${safeFilename}`,
      key: safeFilename,
    };
  }

  async deleteFile(fileUrlOrKey) {
    if (!fileUrlOrKey) return;
    const filename = path.basename(fileUrlOrKey);
    const filePath = path.join(this.uploadDir, filename);

    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        logger.warn('Failed to delete local avatar file:', { filename, error: err.message });
      }
    }
  }
}
