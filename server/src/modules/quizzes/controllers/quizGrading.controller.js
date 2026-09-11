import { SubjectiveReviewService } from '../services/subjectiveReview.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const getPendingReview = async (req, res, next) => {
  try {
    const items = await SubjectiveReviewService.getPendingReviewItems(req.params.quizId);
    ApiResponse.success(res, 200, 'Review queue fetched', { items });
  } catch (err) { next(err); }
};

export const submitReview = async (req, res, next) => {
  try {
    const { questionScoreId } = req.params;
    const { marksAwarded, reviewerFeedback } = req.body;
    const score = await SubjectiveReviewService.reviewQuestion({ questionScoreId, reviewerId: req.user._id, marksAwarded, reviewerFeedback });
    ApiResponse.success(res, 200, 'Review saved', { score });
  } catch (err) { next(err); }
};

export const finalizeResult = async (req, res, next) => {
  try {
    const result = await SubjectiveReviewService.finalizeResult(req.params.resultId, req.user._id);
    ApiResponse.success(res, 200, 'Result finalized', { result });
  } catch (err) { next(err); }
};
