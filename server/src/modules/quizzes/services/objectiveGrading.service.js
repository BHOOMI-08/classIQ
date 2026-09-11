import { QuizAttemptQuestion } from '../models/quizAttemptQuestion.model.js';
import { QuizAnswer } from '../models/quizAnswer.model.js';
import { QuestionScore } from '../models/questionScore.model.js';
import { QUESTION_TYPE, OBJECTIVE_QUESTION_TYPES } from '../utils/quiz.constants.js';
import { matchAnswer } from '../utils/answerNormalization.utils.js';
import { computeProportionalMCQMarks, computeAllOrNothingMCQMarks, clamp } from '../utils/grading.utils.js';

export class ObjectiveGradingService {
  /**
   * Auto-grade all objective questions in an attempt.
   * Returns array of QuestionScore records created.
   */
  static async gradeObjectiveQuestions(attemptId, resultId, quiz) {
    // Load attempt questions with answer keys (select:false fields included via explicit +field)
    const questions = await QuizAttemptQuestion.find({ attemptId })
      .select('+answerKeySnapshot +acceptedAnswersSnapshot +answerMatchingModeSnapshot')
      .lean();

    const answers = await QuizAnswer.find({ attemptId }).lean();
    const answersByQuestionId = {};
    for (const a of answers) {
      answersByQuestionId[a.attemptQuestionId.toString()] = a;
    }

    const scores = [];
    let objectiveMarks = 0;
    let negativeMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let manualReviewCount = 0;

    for (const aq of questions) {
      const answer = answersByQuestionId[aq._id.toString()];
      const isObjective = OBJECTIVE_QUESTION_TYPES.includes(aq.type) ||
        (aq.type === QUESTION_TYPE.SHORT_ANSWER && aq.answerMatchingModeSnapshot !== 'manual');

      if (!isObjective) {
        // Subjective — queue for manual review
        scores.push({
          resultId,
          attemptId,
          attemptQuestionId: aq._id,
          questionId: aq.originalQuestionId,
          topic: aq.topicSnapshot || '',
          marksAvailable: aq.marks,
          marksAwarded: 0,
          negativeMarksApplied: 0,
          gradingMode: 'manual',
          correctness: 'pending_review',
        });
        manualReviewCount++;
        continue;
      }

      if (!answer || answer.status === 'unanswered') {
        scores.push({
          resultId, attemptId, attemptQuestionId: aq._id, questionId: aq.originalQuestionId,
          topic: aq.topicSnapshot || '',
          marksAvailable: aq.marks, marksAwarded: 0, negativeMarksApplied: 0,
          gradingMode: 'automatic', correctness: 'unanswered',
        });
        unansweredCount++;
        continue;
      }

      let marksAwarded = 0;
      let negativePenalty = 0;
      let correctness = 'incorrect';

      switch (aq.type) {
        case QUESTION_TYPE.SINGLE_CHOICE: {
          const correctOption = (aq.optionSnapshot || []).find((o) => o.isCorrect);
          const selected = answer.selectedOptionIds?.[0]?.toString();
          const isCorrect = correctOption && selected === correctOption._id.toString();
          if (isCorrect) {
            marksAwarded = aq.marks;
            correctness = 'correct';
            correctCount++;
          } else if (selected) {
            negativePenalty = quiz?.negativeMarkingEnabled ? (aq.negativeMarks || 0) : 0;
            incorrectCount++;
          } else {
            unansweredCount++;
            correctness = 'unanswered';
          }
          break;
        }

        case QUESTION_TYPE.MULTIPLE_CHOICE: {
          const correctIds = new Set((aq.optionSnapshot || []).filter((o) => o.isCorrect).map((o) => o._id.toString()));
          const selectedIds = new Set((answer.selectedOptionIds || []).map((id) => id.toString()));
          const correctSelected = [...selectedIds].filter((id) => correctIds.has(id)).length;
          const incorrectSelected = [...selectedIds].filter((id) => !correctIds.has(id)).length;

          if (quiz?.partialMarkingEnabled) {
            marksAwarded = computeProportionalMCQMarks({
              marks: aq.marks, negativeMarks: aq.negativeMarks || 0,
              correctSelected, incorrectSelected, totalCorrect: correctIds.size,
            });
          } else {
            marksAwarded = computeAllOrNothingMCQMarks({
              marks: aq.marks, selectedCorrectly: correctSelected,
              totalCorrect: correctIds.size, totalSelected: selectedIds.size,
            });
          }

          if (marksAwarded >= aq.marks) { correctness = 'correct'; correctCount++; }
          else if (marksAwarded > 0) { correctness = 'partially_correct'; }
          else { correctness = 'incorrect'; incorrectCount++; }
          break;
        }

        case QUESTION_TYPE.TRUE_FALSE: {
          const isCorrect = answer.booleanAnswer === aq.answerKeySnapshot;
          if (isCorrect) {
            marksAwarded = aq.marks;
            correctness = 'correct';
            correctCount++;
          } else {
            negativePenalty = quiz?.negativeMarkingEnabled ? (aq.negativeMarks || 0) : 0;
            incorrectCount++;
          }
          break;
        }

        case QUESTION_TYPE.SHORT_ANSWER: {
          const matched = matchAnswer(
            answer.textAnswer || '',
            aq.acceptedAnswersSnapshot || [],
            aq.answerMatchingModeSnapshot || 'manual'
          );
          if (matched) {
            marksAwarded = aq.marks;
            correctness = 'correct';
            correctCount++;
          } else if (aq.answerMatchingModeSnapshot === 'manual') {
            correctness = 'pending_review';
            manualReviewCount++;
            scores.push({
              resultId, attemptId, attemptQuestionId: aq._id, questionId: aq.originalQuestionId,
              topic: aq.topicSnapshot || '', marksAvailable: aq.marks, marksAwarded: 0,
              negativeMarksApplied: 0, gradingMode: 'manual', correctness: 'pending_review',
              selectedOptionIds: [], matchedAnswer: answer.textAnswer,
            });
            continue;
          } else {
            incorrectCount++;
          }
          break;
        }
      }

      marksAwarded = clamp(marksAwarded, 0, aq.marks);
      objectiveMarks += marksAwarded;
      negativeMarks += negativePenalty;

      scores.push({
        resultId, attemptId, attemptQuestionId: aq._id, questionId: aq.originalQuestionId,
        topic: aq.topicSnapshot || '', marksAvailable: aq.marks, marksAwarded,
        negativeMarksApplied: negativePenalty, gradingMode: 'automatic', correctness,
        selectedOptionIds: answer.selectedOptionIds || [],
        matchedAnswer: answer.textAnswer || null,
      });
    }

    // Bulk insert question scores
    await QuestionScore.insertMany(scores);

    return { objectiveMarks, negativeMarks, correctCount, incorrectCount, unansweredCount, manualReviewCount, scores };
  }
}
