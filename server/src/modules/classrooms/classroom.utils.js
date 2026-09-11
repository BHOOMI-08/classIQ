import crypto from 'crypto';

// Characters excluding confusing characters (0, O, 1, I, L)
const CHAR_SET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generate a cryptographically secure random join code string.
 * @param {number} length - Desired code length (default 6)
 * @returns {string} - Generated uppercase join code
 */
export const generateJoinCodeString = (length = 6) => {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = bytes[i] % CHAR_SET.length;
    result += CHAR_SET[randomIndex];
  }
  return result;
};

/**
 * Generate a unique join code by checking against the Classroom model.
 * Retries up to maxRetries times on database collision.
 * @param {Model} ClassroomModel - Mongoose Classroom Model
 * @param {number} maxRetries - Maximum retry attempts (default 10)
 * @returns {Promise<string>} - Unique join code
 */
export const generateUniqueJoinCode = async (ClassroomModel, maxRetries = 10) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateJoinCodeString(6);
    const existing = await ClassroomModel.findOne({ joinCode: code });
    if (!existing) {
      return code;
    }
  }
  // Fallback to 8-char if 6-char collides after maxRetries
  const fallbackBytes = crypto.randomBytes(8);
  let fallbackCode = '';
  for (let i = 0; i < 8; i++) {
    fallbackCode += CHAR_SET[fallbackBytes[i] % CHAR_SET.length];
  }
  return fallbackCode;
};

/**
 * Normalize user-entered join code (trim and uppercase).
 * @param {string} code 
 * @returns {string}
 */
export const normalizeJoinCode = (code) => {
  if (typeof code !== 'string') return '';
  return code.trim().toUpperCase();
};
