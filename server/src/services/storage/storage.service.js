import { LocalStorageProvider } from './local-storage.provider.js';
import { CloudinaryStorageProvider } from './cloudinary-storage.provider.js';
import { env } from '../../config/env.js';

class StorageService {
  constructor() {
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      this.provider = new CloudinaryStorageProvider();
    } else {
      this.provider = new LocalStorageProvider();
    }
  }

  async uploadAvatar(fileBuffer, filename, mimeType) {
    return this.provider.uploadFile(fileBuffer, filename, mimeType);
  }

  async deleteAvatar(fileUrlOrKey) {
    return this.provider.deleteFile(fileUrlOrKey);
  }
}

export const storageService = new StorageService();
