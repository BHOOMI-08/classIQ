export class StorageProvider {
  async uploadFile(_fileBuffer, _filename, _mimeType) {
    throw new Error('uploadFile method must be implemented');
  }

  async deleteFile(_fileUrlOrKey) {
    throw new Error('deleteFile method must be implemented');
  }
}
