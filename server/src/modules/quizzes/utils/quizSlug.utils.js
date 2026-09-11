import crypto from 'crypto';

/**
 * Generate a URL-safe quiz slug from title.
 */
export function generateQuizSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${randomSuffix}`;
}
