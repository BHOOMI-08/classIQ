import {
  PULSE_OPTION_WEIGHTS,
  PULSE_CONFIDENCE_LABELS,
  UNDERSTANDING_LEVELS,
  CONFUSION_LEVELS,
} from './engagement.constants.js';

/**
 * 1. Calculate Confidence Index for Classroom Pulse
 */
export function calculateConfidenceIndex(responseCounts = {}) {
  let totalResponses = 0;
  let weightedSum = 0;

  for (const [optionKey, count] of Object.entries(responseCounts)) {
    const weight = PULSE_OPTION_WEIGHTS[optionKey] ?? 0;
    const numCount = Number(count) || 0;
    totalResponses += numCount;
    weightedSum += weight * numCount;
  }

  if (totalResponses === 0) return null;

  const rawIndex = (weightedSum / (totalResponses * 3)) * 100;
  const confidenceIndex = Math.min(100, Math.max(0, Math.round(rawIndex)));

  let label = PULSE_CONFIDENCE_LABELS.STRONG_CONFIDENCE;
  if (confidenceIndex <= 34) label = PULSE_CONFIDENCE_LABELS.HIGH_CONFUSION;
  else if (confidenceIndex <= 59) label = PULSE_CONFIDENCE_LABELS.DEVELOPING;
  else if (confidenceIndex <= 79) label = PULSE_CONFIDENCE_LABELS.MOSTLY_CLEAR;

  return { confidenceIndex, label, totalResponses };
}

/**
 * 2. Calculate Doubt Priority Score
 */
export function calculateDoubtPriorityScore({
  upvoteCount = 0,
  similarDoubtCount = 0,
  createdAt = new Date(),
  isUnresolved = true,
  topicConfusionRate = 0,
}) {
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 3600);
  const recencyWeight = Math.max(0, 24 - ageInHours) * 0.5; // Bonus for recent doubts
  const unresolvedDurationWeight = isUnresolved ? Math.min(20, ageInHours * 0.8) : 0;
  const confusionBonus = (topicConfusionRate / 100) * 15;

  const score = upvoteCount * 3 + similarDoubtCount * 2 + recencyWeight + unresolvedDurationWeight + confusionBonus;
  return Math.min(100, Math.max(1, Math.round(score)));
}

/**
 * 3. Classify Exit-Ticket Performance Understanding
 */
export function classifyUnderstandingLevel(accuracyPercentage = 0) {
  if (accuracyPercentage >= 80) return UNDERSTANDING_LEVELS.STRONG;
  if (accuracyPercentage >= 60) return UNDERSTANDING_LEVELS.ACCEPTABLE;
  if (accuracyPercentage >= 40) return UNDERSTANDING_LEVELS.NEEDS_REVISION;
  return UNDERSTANDING_LEVELS.CRITICAL;
}

/**
 * 4. Calculate Topic Confusion Score Heatmap
 */
export function calculateTopicConfusionScore({
  quizErrorRate = 0,
  exitTicketErrorRate = 0,
  pulseConfusionRate = 0,
  doubtIntensity = 0,
  revisionFrequency = 0,
}) {
  const score =
    quizErrorRate * 0.30 +
    exitTicketErrorRate * 0.25 +
    pulseConfusionRate * 0.20 +
    doubtIntensity * 0.15 +
    revisionFrequency * 0.10;

  const confusionScore = Math.min(100, Math.max(0, Math.round(score)));

  let classification = CONFUSION_LEVELS.LOW;
  if (confusionScore >= 76) classification = CONFUSION_LEVELS.CRITICAL;
  else if (confusionScore >= 51) classification = CONFUSION_LEVELS.HIGH;
  else if (confusionScore >= 26) classification = CONFUSION_LEVELS.MODERATE;

  return { confusionScore, classification };
}
