import { QuizAttempt } from '../models/quizAttempt.model.js';
import { QuizAttemptQuestion } from '../models/quizAttemptQuestion.model.js';
import { QuizAttemptEvent } from '../models/quizAttemptEvent.model.js';
import { QuizQuestionMap } from '../models/quizQuestionMap.model.js';
import { Question } from '../models/question.model.js';
import { QuizAccessService } from './quizAccess.service.js';
import { QuestionSnapshotService } from './questionSnapshot.service.js';
import { generateAttemptToken, generateReceiptCode } from '../utils/attemptToken.utils.js';
import { cryptoShuffle, randomSubset, topicBalancedSubset, difficultyBalancedSubset, generateOptionOrders } from '../utils/randomization.utils.js';
import { ApiError } from '../../../utils/api-error.js';
import { ELIGIBILITY, ACTIVE_ATTEMPT_STATUSES } from '../utils/quiz.constants.js';
import { getIO } from '../../../socket/socket.server.js';
import { logger } from '../../../utils/logger.js';

export class QuizAttemptService {
  /**
   * Start a new secure attempt — server-authoritative.
   */
  static async startAttempt(quizId, studentId) {
    const { eligible, reason, quiz, grant, effectiveDurationMinutes, effectiveOpeningAt, effectiveClosingAt, activeAttempt } = await QuizAccessService.resolveEligibility(quizId, studentId);

    // If already in progress, return existing attempt state
    if (reason === ELIGIBILITY.IN_PROGRESS && activeAttempt) {
      const existingSnapshot = await QuizAttemptQuestion.find({ attemptId: activeAttempt._id }).sort({ displayOrder: 1 }).lean();
      return { attempt: activeAttempt, questions: existingSnapshot, resuming: true };
    }

    if (!eligible) {
      throw ApiError.forbidden(`Quiz not available: ${reason}`);
    }

    // Count existing terminal attempts to determine attempt number
    const existingCount = await QuizAttempt.countDocuments({ quizId, studentId });
    const attemptNumber = existingCount + 1;

    // Server-authoritative time calculations
    const now = new Date();
    const durationSeconds = effectiveDurationMinutes * 60;
    const expiresAtByDuration = new Date(now.getTime() + durationSeconds * 1000);
    const expiresAt = (quiz.forceSubmitAtClosing && effectiveClosingAt && effectiveClosingAt < expiresAtByDuration)
      ? effectiveClosingAt
      : expiresAtByDuration;

    // Generate attempt token
    const { plainToken, hashedToken } = generateAttemptToken();

    // Select and randomize questions
    const allMaps = await QuizQuestionMap.find({ quizId }).sort({ order: 1 }).lean();
    let selectedMaps = allMaps;

    const questionsPerAttempt = quiz.questionsPerAttempt;
    if (questionsPerAttempt && questionsPerAttempt < allMaps.length) {
      switch (quiz.questionSelectionMode) {
        case 'random_subset':
          selectedMaps = randomSubset(allMaps, questionsPerAttempt);
          break;
        case 'topic_balanced':
          selectedMaps = topicBalancedSubset(allMaps, questionsPerAttempt);
          break;
        case 'difficulty_balanced':
          selectedMaps = difficultyBalancedSubset(allMaps, questionsPerAttempt);
          break;
        default:
          selectedMaps = allMaps.slice(0, questionsPerAttempt);
      }
    }

    const orderedMaps = quiz.randomizeQuestions ? cryptoShuffle(selectedMaps) : selectedMaps;

    // Build display order map
    const displayOrders = {};
    orderedMaps.forEach((m, idx) => { displayOrders[m.questionId.toString()] = idx + 1; });

    // Load questions for snapshot creation
    const questionIds = orderedMaps.map((m) => m.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    // Generate stable per-attempt option orders
    const tempSnapshotsForOrder = questions.map((q) => ({ originalQuestionId: q._id, optionSnapshot: [] }));
    // We'll get options through snapshot service
    const optionOrders = quiz.randomizeOptions
      ? await QuizAttemptService._generateOptionOrdersForMaps(questions)
      : {};

    // Create attempt record
    const attempt = await QuizAttempt.create({
      quizId,
      classroomId: quiz.classroomId,
      studentId,
      attemptNumber,
      status: 'in_progress',
      startedAt: now,
      effectiveStartAt: now,
      expiresAt,
      lastActivityAt: now,
      serverTimeAtStart: now,
      durationSeconds,
      remainingSecondsAtLastSave: durationSeconds,
      questionOrder: orderedMaps.map((m) => m.questionId),
      optionOrders,
      selectedQuestionIds: questionIds,
      attemptTokenHash: hashedToken,
      sessionNonce: generateReceiptCode(),
      effectiveOpeningAt: effectiveOpeningAt || now,
      effectiveClosingAt: effectiveClosingAt || null,
      accessGrantId: grant?._id || null,
    });

    // Create immutable question snapshots
    const snapshotQuestions = await QuestionSnapshotService.createSnapshots({
      attemptId: attempt._id,
      quizId,
      questions,
      questionMaps: orderedMaps,
      optionOrders,
      displayOrders,
    });

    // Record event
    await QuizAttemptEvent.create({
      attemptId: attempt._id,
      quizId,
      studentId,
      eventType: 'attempt_started',
      metadata: { attemptNumber },
      serverTimestamp: now,
    });

    // Notify teacher
    try {
      const io = getIO();
      io.to(`quiz_monitor:${quizId}`).emit('quiz:attempt_started', {
        quizId,
        attemptId: attempt._id,
        studentId,
        attemptNumber,
        startedAt: now,
      });
    } catch (_) {}

    logger.info(`🎯 Quiz attempt started: ${quizId} by student ${studentId} (attempt #${attemptNumber})`);

    // Return WITHOUT answer keys — student serializer on snapshots handles exclusion
    const studentQuestions = snapshotQuestions.map((sq) => ({
      _id: sq._id,
      originalQuestionId: sq.originalQuestionId,
      displayOrder: sq.displayOrder,
      type: sq.type,
      promptSnapshot: sq.promptSnapshot,
      contextSnapshot: sq.contextSnapshot,
      instructionsSnapshot: sq.instructionsSnapshot,
      topicSnapshot: sq.topicSnapshot,
      difficultySnapshot: sq.difficultySnapshot,
      marks: sq.marks,
      negativeMarks: sq.negativeMarks,
      optionSnapshot: (sq.optionSnapshot || []).map(({ _id, text, label, order, misconceptionTag }) => ({ _id, text, label, order, misconceptionTag })),
      caseSnapshot: sq.caseSnapshot,
      codingConfigSnapshot: sq.codingConfigSnapshot,
    }));

    return {
      attempt: { ...attempt.toObject(), attemptToken: plainToken }, // plain token sent once
      questions: studentQuestions,
      serverTime: now,
      resuming: false,
    };
  }

  static async _generateOptionOrdersForMaps(questions) {
    const { QuestionOption } = await import('../models/questionOption.model.js');
    const orders = {};
    for (const q of questions) {
      const opts = await QuestionOption.find({ questionId: q._id }).sort({ order: 1 }).lean();
      orders[q._id.toString()] = cryptoShuffle(opts.map((o) => o._id.toString()));
    }
    return orders;
  }

  static async getAttemptState(attemptId, studentId) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, studentId }).lean();
    if (!attempt) throw ApiError.notFound('Attempt not found');

    const questions = await QuizAttemptQuestion.find({ attemptId }).sort({ displayOrder: 1 }).lean();
    // Strip answer keys from student view
    const studentQuestions = questions.map((sq) => ({
      _id: sq._id,
      originalQuestionId: sq.originalQuestionId,
      displayOrder: sq.displayOrder,
      type: sq.type,
      promptSnapshot: sq.promptSnapshot,
      contextSnapshot: sq.contextSnapshot,
      instructionsSnapshot: sq.instructionsSnapshot,
      topicSnapshot: sq.topicSnapshot,
      difficultySnapshot: sq.difficultySnapshot,
      marks: sq.marks,
      negativeMarks: sq.negativeMarks,
      optionSnapshot: (sq.optionSnapshot || []).map(({ _id, text, label, order }) => ({ _id, text, label, order })),
      caseSnapshot: sq.caseSnapshot,
      codingConfigSnapshot: sq.codingConfigSnapshot,
    }));

    return { attempt, questions: studentQuestions, serverTime: new Date() };
  }
}
