import { AIUsageLog } from '../models/AIUsageLog.js';
import { AIInteraction } from '../models/AIInteraction.js';
import { DEFAULT_AI_QUOTAS } from '../ai.constants.js';
import { AIQuotaExceededError } from '../ai.errors.js';

export class AIUsageService {
  static getDateBucket() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Enforces daily quota limits per user.
   */
  static async checkDailyUserQuota(userId) {
    const dateBucket = this.getDateBucket();
    const count = await AIUsageLog.countDocuments({ userId, dateBucket, status: 'success' });
    if (count >= DEFAULT_AI_QUOTAS.DAILY_USER_LIMIT) {
      throw new AIQuotaExceededError(`You have reached your daily limit of ${DEFAULT_AI_QUOTAS.DAILY_USER_LIMIT} AI requests.`);
    }
  }

  /**
   * Log usage metric and audit interaction.
   */
  static async logUsage({
    userId,
    userRole,
    classroomId = null,
    feature,
    model = 'gemini-1.5-flash',
    promptTokens = 0,
    responseTokens = 0,
    latencyMs = 0,
    grounded = false,
    citationCount = 0,
    status = 'success',
    errorCode = '',
  }) {
    const dateBucket = this.getDateBucket();
    const totalTokens = promptTokens + responseTokens;
    const estimatedCostUsd = (totalTokens / 1000) * 0.00015; // approximate cost

    await Promise.all([
      AIUsageLog.create({
        userId,
        classroomId,
        feature,
        model,
        requestTokens: promptTokens,
        responseTokens,
        totalTokens,
        estimatedCostUsd,
        latencyMs,
        status,
        errorCode,
        dateBucket,
      }),
      AIInteraction.create({
        userId,
        role: userRole,
        classroomId,
        feature,
        status,
        model,
        grounded,
        citationCount,
        latencyMs,
        promptTokens,
        responseTokens,
        totalTokens,
        errorCode,
      }),
    ]);
  }
}
