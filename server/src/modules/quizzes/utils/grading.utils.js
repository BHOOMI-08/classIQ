import { GRADE_THRESHOLDS } from './quiz.constants.js';

/**
 * Map percentage to grade label.
 */
export function getGradeLabel(percentage) {
  for (const { label, min } of GRADE_THRESHOLDS) {
    if (percentage >= min) return label;
  }
  return 'F';
}

/**
 * Clamp value between min and max.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute proportional MCQ marks.
 * Formula: positiveMarks = marks * (correctSelected / totalCorrect)
 *          wrongPenalty = negativeMarks * incorrectSelected
 *          awarded = max(0, positiveMarks - wrongPenalty)
 */
export function computeProportionalMCQMarks({ marks, negativeMarks, correctSelected, incorrectSelected, totalCorrect }) {
  if (totalCorrect === 0) return 0;
  const positiveMarks = marks * (correctSelected / totalCorrect);
  const wrongPenalty = negativeMarks * incorrectSelected;
  return Math.max(0, positiveMarks - wrongPenalty);
}

/**
 * Compute all-or-nothing MCQ marks.
 */
export function computeAllOrNothingMCQMarks({ marks, selectedCorrectly, totalCorrect, totalSelected }) {
  if (selectedCorrectly === totalCorrect && totalSelected === totalCorrect) return marks;
  return 0;
}

/**
 * Proficiency label from accuracy percentage.
 */
export function getProficiencyLabel(accuracy) {
  if (accuracy >= 80) return 'strong';
  if (accuracy >= 60) return 'developing';
  if (accuracy >= 40) return 'needs_revision';
  return 'critical';
}
