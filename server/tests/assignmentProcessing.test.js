import { DeadlineService } from '../src/modules/assignments/services/deadline.service.js';
import { LatePolicyService } from '../src/modules/assignments/services/latePolicy.service.js';
import { GradingService } from '../src/modules/assignments/services/grading.service.js';
import { AssignmentAIService } from '../src/modules/assignments/services/assignmentAI.service.js';

describe('Module 5 — Assignment & Submission Processing Engine', () => {
  test('DeadlineService calculates late status and duration correctly', () => {
    const dueAt = new Date('2026-08-01T12:00:00Z');
    const onTimeSub = new Date('2026-08-01T11:55:00Z');
    const lateSub = new Date('2026-08-01T12:45:00Z');

    const onTimeResult = DeadlineService.calculateLateStatus(onTimeSub, dueAt);
    expect(onTimeResult.isLate).toBe(false);
    expect(onTimeResult.lateByMinutes).toBe(0);

    const lateResult = DeadlineService.calculateLateStatus(lateSub, dueAt);
    expect(lateResult.isLate).toBe(true);
    expect(lateResult.lateByMinutes).toBe(45);
  });

  test('LatePolicyService calculates late penalties server-authoritatively', () => {
    const penaltyResult = LatePolicyService.calculatePenalty({
      totalMarks: 100,
      rawMarks: 85,
      lateByMinutes: 1440, // 1 day late
      latePolicy: {
        mode: 'allowed_with_penalty',
        penaltyType: 'percentage_per_day',
        penaltyValue: 10, // 10% per day
      },
      allowLateSubmission: true,
    });

    expect(penaltyResult.penaltyMarks).toBe(10); // 10% of 100 = 10 marks
  });

  test('LatePolicyService clamps penalty marks safely', () => {
    const penaltyResult = LatePolicyService.calculatePenalty({
      totalMarks: 50,
      rawMarks: 15,
      lateByMinutes: 10000, // Very late
      latePolicy: {
        mode: 'allowed_with_penalty',
        penaltyType: 'fixed_per_day',
        penaltyValue: 100,
      },
      allowLateSubmission: true,
    });

    expect(penaltyResult.penaltyMarks).toBe(15); // Clamped to rawMarks max
  });

  test('GradingService maps percentage to letter grade labels', () => {
    expect(GradingService.getGradeLabel(95)).toBe('A+');
    expect(GradingService.getGradeLabel(85)).toBe('A');
    expect(GradingService.getGradeLabel(75)).toBe('B');
    expect(GradingService.getGradeLabel(65)).toBe('C');
    expect(GradingService.getGradeLabel(55)).toBe('D');
    expect(GradingService.getGradeLabel(40)).toBe('F');
  });

  test('AssignmentAIService generates valid assignment structure', async () => {
    const generated = await AssignmentAIService.generateAssignment({
      classroomId: '60d5ecb8b5c9c22b1c8e9999',
      topic: 'Calculus',
      unit: 'Unit 1',
      difficulty: 'medium',
      totalMarks: 50,
      assignmentType: 'homework',
    });

    expect(generated.title).toBeDefined();
    expect(generated.totalMarks).toBe(50);
    expect(Array.isArray(generated.tasks)).toBe(true);
    expect(generated.tasks.length).toBeGreaterThan(0);
  });
});
