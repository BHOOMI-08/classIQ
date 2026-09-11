import { ApiError } from '../../../utils/api-error.js';
import { QUESTION_TYPE } from '../utils/quiz.constants.js';

export class QuestionValidationService {
  static async validate(questionData) {
    const { type, options = [], answerKey, acceptedAnswers = [], answerMatchingMode, prompt } = questionData;

    if (!prompt || !prompt.trim()) {
      throw ApiError.badRequest('Question prompt is required');
    }

    switch (type) {
      case QUESTION_TYPE.SINGLE_CHOICE: {
        if (!Array.isArray(options) || options.length < 2) {
          throw ApiError.badRequest('Single-choice questions require at least 2 options');
        }
        const correctCount = options.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          throw ApiError.badRequest('Single-choice question must have exactly 1 correct option');
        }
        break;
      }

      case QUESTION_TYPE.MULTIPLE_CHOICE: {
        if (!Array.isArray(options) || options.length < 2) {
          throw ApiError.badRequest('Multiple-choice questions require at least 2 options');
        }
        const correctCount = options.filter((o) => o.isCorrect).length;
        if (correctCount < 1) {
          throw ApiError.badRequest('Multiple-choice question must have at least 1 correct option');
        }
        break;
      }

      case QUESTION_TYPE.TRUE_FALSE: {
        if (answerKey !== true && answerKey !== false) {
          throw ApiError.badRequest('True/false question must have a boolean answerKey (true or false)');
        }
        break;
      }

      case QUESTION_TYPE.SHORT_ANSWER: {
        if (!Array.isArray(acceptedAnswers) || acceptedAnswers.length === 0) {
          if (!answerMatchingMode || answerMatchingMode === 'manual') break; // manual review OK
          throw ApiError.badRequest('Short-answer questions with auto-grading require at least one accepted answer');
        }
        break;
      }

      case QUESTION_TYPE.LONG_ANSWER:
      case QUESTION_TYPE.CODING:
      case QUESTION_TYPE.CASE_BASED:
        // Manual review required — no strict constraints
        break;

      default:
        throw ApiError.badRequest(`Unsupported question type: ${type}`);
    }
  }
}
