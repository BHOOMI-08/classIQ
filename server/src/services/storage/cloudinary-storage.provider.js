export class CloudinaryStorageProvider {
  async uploadFile(_fileBuffer, _filename, _mimeType) {
    // Fallback/stub for production Cloudinary integration if configured
    throw new Error('CloudinaryStorageProvider not configured in development mode.');
  }

  async deleteFile(_fileUrlOrKey) {
    // Stub
  }
}
