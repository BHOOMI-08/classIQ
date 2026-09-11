import { ResourceAIService } from '../services/resourceAI.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const generateSummary = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const artifact = await ResourceAIService.generateSummary({
      resourceId,
      teacherId: req.user._id,
    });
    return ApiResponse.created(res, 'AI summary generated successfully', { artifact });
  } catch (err) {
    next(err);
  }
};

export const generateFlashcards = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { count } = req.body;
    const artifact = await ResourceAIService.generateFlashcards({
      resourceId,
      teacherId: req.user._id,
      count: count || 5,
    });
    return ApiResponse.created(res, 'AI flashcards generated successfully', { artifact });
  } catch (err) {
    next(err);
  }
};

export const generateRevisionQuestions = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { count } = req.body;
    const artifact = await ResourceAIService.generateRevisionQuestions({
      resourceId,
      teacherId: req.user._id,
      count: count || 5,
    });
    return ApiResponse.created(res, 'AI revision questions generated successfully', { artifact });
  } catch (err) {
    next(err);
  }
};

export const getArtifacts = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const artifacts = await ResourceAIService.getArtifacts(resourceId);
    return ApiResponse.success(res, 'AI artifacts retrieved', { items: artifacts });
  } catch (err) {
    next(err);
  }
};
