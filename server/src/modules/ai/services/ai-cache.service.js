const cacheStore = new Map();

export class AICacheService {
  static buildCacheKey({ classroomId, feature, prompt, version = 'v1' }) {
    const cleanPrompt = String(prompt).toLowerCase().trim().replace(/\s+/g, '_');
    return `${classroomId}_${feature}_${version}_${cleanPrompt}`;
  }

  static get(key) {
    const item = cacheStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      cacheStore.delete(key);
      return null;
    }
    return item.value;
  }

  static set(key, value, ttlSeconds = 3600) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    cacheStore.set(key, { value, expiresAt });
  }

  static invalidateClassroomCache(classroomId) {
    for (const key of cacheStore.keys()) {
      if (key.startsWith(`${classroomId}_`)) {
        cacheStore.delete(key);
      }
    }
  }
}
