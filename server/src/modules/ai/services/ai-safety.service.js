import { AIPromptInjectionError } from '../ai.errors.js';

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+(instructions|prompts)/i,
  /system\s+prompt\s+override/i,
  /reveal\s+(your\s+)?(system\s+prompt|api\s+key|secret)/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /bypass\s+(safety|content)\s+(filters|rules)/i,
  /disregard\s+above\s+text/i,
];

export class AISafetyService {
  /**
   * Sanitizes input and checks for prompt injection attacks.
   */
  static validateInputSafety(inputText = '') {
    if (!inputText || typeof inputText !== 'string') return '';

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(inputText)) {
        throw new AIPromptInjectionError('Input contains forbidden system instruction override attempt');
      }
    }

    // Sanitize HTML script tags
    return inputText
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
  }
}
