import mongoose from 'mongoose';
import { StudyPlan } from '../models/StudyPlan.js';
import { StudyTask } from '../models/StudyTask.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { Assignment } from '../../assignments/models/assignment.model.js';
import { Quiz } from '../../quizzes/models/quiz.model.js';
import { AttendanceRecord } from '../../attendance/attendanceRecord.model.js';
import { ResourceProgress } from '../../content/models/resourceProgress.model.js';
import { GeminiService } from './gemini.service.js';
import { AIPromptBuilderService } from './prompt-builder.service.js';
import { ApiError } from '../../../utils/api-error.js';

export class StudyPlannerService {
  static calculatePriorityScore({ daysToDeadline = 7, isOverdue = false, weaknessScore = 50, isExamNearby = false }) {
    const deadlineUrgency = Math.max(0, 10 - daysToDeadline) * 4;
    const academicImpact = 30;
    const weaknessSeverity = (100 - weaknessScore) * 0.3;
    const overduePenalty = isOverdue ? 25 : 0;
    const examProximity = isExamNearby ? 20 : 0;

    const rawScore = deadlineUrgency + academicImpact + weaknessSeverity + overduePenalty + examProximity;
    const finalScore = Math.min(100, Math.max(10, Math.round(rawScore)));

    let priorityLabel = 'medium';
    if (finalScore >= 80) priorityLabel = 'urgent_critical';
    else if (finalScore >= 65) priorityLabel = 'high';
    else if (finalScore <= 35) priorityLabel = 'low';

    return { priorityScore: finalScore, priorityLabel };
  }

  /**
   * Deterministic Priority Calculation Algorithm.
   * Calculates priority scores for study items based on urgency, difficulty, and student performance.
   */
  static calculateItemPriority({ daysToDeadline = 7, isOverdue = false, performanceScore = 70, attendanceRate = 90 }) {
    return this.calculatePriorityScore({ daysToDeadline, isOverdue, weaknessScore: performanceScore });
  }

  /**
   * Automatically collect student data across backend modules and generate AI Study Plan.
   */
  static async generateStudyPlan(studentId, { classroomIds = [], dailyAvailableHours = 2, examDates = [], weakTopics = [] }) {
    const dailyAvailableMinutes = Math.round(dailyAvailableHours * 60);
    const startDate = new Date();
    const endDate = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7-day schedule window

    // 1. Automatically collect Attendance Rate
    const totalAttendance = await AttendanceRecord.countDocuments({ studentId });
    const presentAttendance = await AttendanceRecord.countDocuments({ studentId, status: 'present' });
    const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

    // 2. Automatically collect Pending Assignments
    const assignmentFilter = { status: 'published', dueDate: { $gte: startDate } };
    if (classroomIds.length > 0) assignmentFilter.classroomId = { $in: classroomIds };
    const pendingAssignments = await Assignment.find(assignmentFilter).lean();

    // 3. Automatically collect Upcoming Quizzes
    const quizFilter = { status: 'published', closingAt: { $gte: startDate } };
    if (classroomIds.length > 0) quizFilter.classroomId = { $in: classroomIds };
    const upcomingQuizzes = await Quiz.find(quizFilter).lean();

    // 4. Automatically collect Resource Completion
    const progressRecords = await ResourceProgress.find({ studentId }).lean();
    const completedResourceIds = progressRecords
      .filter((p) => p && p.isCompleted && p.resourceId)
      .map((p) => p.resourceId.toString());

    // 5. Backend Priority Calculation
    const priorityItems = [];

    pendingAssignments.forEach((assign) => {
      const daysLeft = Math.max(1, Math.ceil((new Date(assign.dueDate) - startDate) / (1000 * 3600 * 24)));
      const { priorityScore, priorityLabel } = this.calculateItemPriority({ daysToDeadline: daysLeft, attendanceRate });
      priorityItems.push({
        title: assign.title,
        type: 'assignment',
        daysLeft,
        priorityScore,
        priorityLabel,
        classroomId: assign.classroomId,
        assignmentId: assign._id,
      });
    });

    upcomingQuizzes.forEach((quiz) => {
      const daysLeft = Math.max(1, Math.ceil((new Date(quiz.closingAt || quiz.createdAt) - startDate) / (1000 * 3600 * 24)));
      const { priorityScore, priorityLabel } = this.calculateItemPriority({ daysToDeadline: daysLeft, attendanceRate });
      priorityItems.push({
        title: quiz.title,
        type: 'quiz_prep',
        daysLeft,
        priorityScore,
        priorityLabel,
        classroomId: quiz.classroomId,
        quizId: quiz._id,
      });
    });

    weakTopics.forEach((topicName) => {
      priorityItems.push({
        title: `Revision: ${topicName}`,
        type: 'revision',
        priorityScore: 75,
        priorityLabel: 'high',
        topic: topicName,
      });
    });

    // 6. Gemini Output Formatting Prompt
    const prompt = AIPromptBuilderService.buildStudyPlannerPrompt({
      userInputs: { dailyAvailableHours, examDates, weakTopics },
      priorityAnalysis: priorityItems,
      backendMetrics: {
        attendanceRate,
        pendingAssignmentsCount: pendingAssignments.length,
        upcomingQuizzesCount: upcomingQuizzes.length,
        completedResourceCount: completedResourceIds.length,
      },
    });

    const geminiRes = await GeminiService.generateStructuredJson({
      prompt,
      systemInstruction: 'You are an expert academic planner. Convert backend priorities into structured JSON study schedules.',
      temperature: 0.2,
      maxTokens: 2048,
    });

    // 7. Save or Update Active StudyPlan in DB
    let studyPlan = await StudyPlan.findOne({ studentId, status: 'active' });
    if (!studyPlan) {
      studyPlan = await StudyPlan.create({
        studentId,
        startDate,
        endDate,
        dailyAvailableMinutes,
        status: 'active',
      });
    } else {
      studyPlan.startDate = startDate;
      studyPlan.endDate = endDate;
      studyPlan.dailyAvailableMinutes = dailyAvailableMinutes;
      studyPlan.lastRecalculatedAt = startDate;
      await studyPlan.save();
    }

    // Resolve a valid classroomId for tasks
    let resolvedClassroomId = classroomIds && classroomIds.length > 0 && mongoose.Types.ObjectId.isValid(classroomIds[0]) ? classroomIds[0] : null;
    if (!resolvedClassroomId) {
      const enrollment = await Enrollment.findOne({ studentId, status: 'active' });
      if (enrollment) {
        resolvedClassroomId = enrollment.classroomId;
      } else {
        resolvedClassroomId = new mongoose.Types.ObjectId();
      }
    }

    // Insert new generated tasks
    const newTasks = [];
    const generatedDays = geminiRes.data.dailySchedule || [];

    for (const day of generatedDays) {
      const scheduledDate = day.date ? new Date(day.date) : new Date();
      for (const t of day.tasks || []) {
        newTasks.push({
          studyPlanId: studyPlan._id,
          studentId,
          scheduledDate,
          startTime: t.timeSlot?.split('-')?.[0]?.trim() || '09:00',
          durationMinutes: 45,
          type: t.type || 'revision',
          title: t.title || 'Study Session',
          description: t.description || '',
          classroomId: resolvedClassroomId,
          topic: t.topic || 'General',
          priorityScore: t.priority === 'urgent_critical' ? 90 : t.priority === 'high' ? 75 : 50,
          priorityLabel: t.priority || 'medium',
          status: 'pending',
          source: 'deterministic_engine',
        });
      }
    }

    if (newTasks.length === 0) {
      // Fallback default tasks if Gemini output was sparse
      newTasks.push({
        studyPlanId: studyPlan._id,
        studentId,
        scheduledDate: startDate,
        startTime: '10:00',
        durationMinutes: 60,
        type: 'revision',
        title: 'Core Concept Revision',
        description: 'Review course notes and completed assignments.',
        classroomId: resolvedClassroomId,
        priorityScore: 70,
        priorityLabel: 'high',
        status: 'pending',
      });
    }

    const tasks = await StudyTask.insertMany(newTasks);

    return {
      studyPlan,
      tasks,
      formattedSchedule: geminiRes.data,
      metrics: { attendanceRate, pendingAssignmentsCount: pendingAssignments.length, upcomingQuizzesCount: upcomingQuizzes.length },
    };
  }

  /**
   * Fetch active study plan and its associated tasks.
   */
  static async getStudyPlan(studentId) {
    const studyPlan = await StudyPlan.findOne({ studentId, status: 'active' }).lean();
    if (!studyPlan) {
      return { studyPlan: null, tasks: [] };
    }

    const tasks = await StudyTask.find({ studyPlanId: studyPlan._id })
      .sort({ scheduledDate: 1, startTime: 1 })
      .lean();

    return { studyPlan, tasks };
  }

  /**
   * Update task status (mark completed or skipped).
   */
  static async updateTask(studentId, taskId, { status, skipReason = '' }) {
    const task = await StudyTask.findOne({ _id: taskId, studentId });
    if (!task) {
      throw ApiError.notFound('Study task not found');
    }

    if (status) task.status = status;
    if (status === 'completed') task.completedAt = new Date();
    if (skipReason) task.skipReason = skipReason;

    await task.save();
    return task;
  }

  /**
   * Recalculate remaining schedule when tasks are skipped or completed.
   */
  static async recalculatePlan(studentId, studyPlanId) {
    const studyPlan = await StudyPlan.findOne({ _id: studyPlanId, studentId });
    if (!studyPlan) {
      throw ApiError.notFound('Study plan not found');
    }

    // Preserve completed tasks
    const completedTasksCount = await StudyTask.countDocuments({ studyPlanId, status: 'completed' });

    // Regenerate new plan tasks for remaining days
    const result = await this.generateStudyPlan(studentId, {
      dailyAvailableHours: studyPlan.dailyAvailableMinutes / 60,
    });

    return {
      studyPlan: result.studyPlan,
      tasks: result.tasks,
      recalculated: true,
      completedPreservedCount: completedTasksCount,
    };
  }
}
