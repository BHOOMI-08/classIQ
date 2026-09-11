import { PulseService } from '../services/pulse.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export async function createPulse(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { classId } = req.params;

    const pulse = await PulseService.createPulse(teacherId, classId, req.body);
    return ApiResponse.created(res, { pulse }, 'Classroom pulse session started');
  } catch (error) {
    next(error);
  }
}

export async function getClassroomPulses(req, res, next) {
  try {
    const { classId } = req.params;
    const { ClassroomPulse } = await import('../models/classroomPulse.model.js');
    const pulses = await ClassroomPulse.find({ classroomId: classId }).sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, 200, 'Pulses fetched successfully', { pulses });
  } catch (error) {
    next(error);
  }
}

export async function getPulseById(req, res, next) {
  try {
    const { pulseId } = req.params;
    const results = await PulseService.getPulseResults(pulseId);
    return ApiResponse.success(res, 200, 'Pulse details fetched', results);
  } catch (error) {
    next(error);
  }
}

export async function respondPulse(req, res, next) {
  try {
    const studentId = req.user._id;
    const { pulseId } = req.params;
    const { response } = req.body;

    const responseDoc = await PulseService.respondPulse(studentId, pulseId, response);
    return ApiResponse.success(res, 200, 'Pulse response submitted', { response: responseDoc });
  } catch (error) {
    next(error);
  }
}

export async function closePulse(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { pulseId } = req.params;

    const result = await PulseService.closePulse(teacherId, pulseId);
    return ApiResponse.success(res, 200, 'Pulse session closed', result);
  } catch (error) {
    next(error);
  }
}
