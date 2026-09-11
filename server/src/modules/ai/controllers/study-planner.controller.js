import { StudyPlannerService } from '../services/study-planner.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export async function createStudyPlan(req, res, next) {
  try {
    const studentId = req.user._id;
    const { classroomIds, dailyAvailableHours, dailyAvailableMinutes, examDates, weakTopics } = req.body;

    const hours = dailyAvailableHours || (dailyAvailableMinutes ? dailyAvailableMinutes / 60 : 2);

    const result = await StudyPlannerService.generateStudyPlan(studentId, {
      classroomIds: classroomIds || [],
      dailyAvailableHours: hours,
      examDates: examDates || [],
      weakTopics: weakTopics || [],
    });

    return ApiResponse.created(res, result, 'Study plan created successfully');
  } catch (error) {
    next(error);
  }
}

export async function getStudyPlans(req, res, next) {
  try {
    const studentId = req.user._id;

    const result = await StudyPlannerService.getStudyPlan(studentId);

    return ApiResponse.success(res, 200, 'Active study plan fetched successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function updateStudyPlanTask(req, res, next) {
  try {
    const studentId = req.user._id;
    const { id } = req.params;
    const { status, skipReason } = req.body;

    const task = await StudyPlannerService.updateTask(studentId, id, { status, skipReason });

    return ApiResponse.success(res, 200, 'Study task updated successfully', { task });
  } catch (error) {
    next(error);
  }
}

export async function recalculateStudyPlan(req, res, next) {
  try {
    const studentId = req.user._id;
    const { id } = req.params;

    const result = await StudyPlannerService.recalculatePlan(studentId, id);

    return ApiResponse.success(res, 200, 'Study schedule recalculated successfully', result);
  } catch (error) {
    next(error);
  }
}
