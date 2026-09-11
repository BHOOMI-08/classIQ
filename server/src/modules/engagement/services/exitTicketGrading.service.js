import { classifyUnderstandingLevel } from '../utils/engagementScoring.utils.js';

export class ExitTicketGradingService {
  /**
   * Grade an exit ticket attempt against question answer keys.
   */
  static gradeAttempt(questions = [], studentAnswers = []) {
    let totalMarks = 0;
    let marksAwarded = 0;
    let requiresReview = false;

    const answerResults = [];

    questions.forEach((q) => {
      const qIdStr = q._id.toString();
      const studentAns = studentAnswers.find((a) => a.questionId.toString() === qIdStr);
      const markVal = q.marks || 1;
      totalMarks += markVal;

      if (!studentAns || !studentAns.responseValue) {
        answerResults.push({
          questionId: q._id,
          responseValue: '',
          isCorrect: false,
          marksAwarded: 0,
          feedback: 'No answer submitted',
        });
        return;
      }

      const userVal = String(studentAns.responseValue).trim().toLowerCase();
      let isCorrect = false;
      let awarded = 0;

      if (q.type === 'single_choice' || q.type === 'true_false') {
        const expected = String(q.correctAnswer || '').trim().toLowerCase();
        if (expected && userVal === expected) {
          isCorrect = true;
          awarded = markVal;
        }
      } else if (q.type === 'confidence_scale') {
        // Confidence scale question (1-5) is self-assessment (gives full credit)
        isCorrect = true;
        awarded = markVal;
      } else if (q.type === 'short_answer') {
        // Keyword match against acceptedAnswers
        const accepted = (q.acceptedAnswers || []).map((a) => a.toLowerCase().trim());
        if (q.correctAnswer) accepted.push(q.correctAnswer.toLowerCase().trim());

        const hasMatch = accepted.some((acc) => acc && (userVal === acc || userVal.includes(acc)));
        if (hasMatch) {
          isCorrect = true;
          awarded = markVal;
        } else {
          requiresReview = true; // Short answer may require manual teacher check
        }
      }

      marksAwarded += awarded;

      answerResults.push({
        questionId: q._id,
        responseValue: studentAns.responseValue,
        isCorrect,
        marksAwarded: awarded,
        feedback: isCorrect ? 'Correct!' : 'Incorrect',
      });
    });

    const percentage = totalMarks > 0 ? Number(((marksAwarded / totalMarks) * 100).toFixed(1)) : 0;
    const understandingLabel = classifyUnderstandingLevel(percentage);

    return {
      totalMarks,
      marksAwarded,
      percentage,
      understandingLabel,
      requiresReview,
      answerResults,
    };
  }
}
