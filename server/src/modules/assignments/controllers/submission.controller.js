import { SubmissionService } from '../services/submission.service.js';
import { Submission } from '../models/submission.model.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const saveDraftSubmission = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { submissionText, submissionNote, externalLink } = req.body;

    const submission = await SubmissionService.saveDraft({
      assignmentId,
      studentId: req.user._id,
      submissionText,
      submissionNote,
      externalLink,
      files: req.files,
    });

    return ApiResponse.success(res, 'Submission draft saved', { submission });
  } catch (err) {
    next(err);
  }
};

export const submitFinalAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { submissionText, submissionNote, externalLink } = req.body;

    const result = await SubmissionService.finalizeSubmission({
      assignmentId,
      studentId: req.user._id,
      submissionText,
      submissionNote,
      externalLink,
      files: req.files,
    });

    return ApiResponse.created(res, 'Submission received successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getStudentSubmission = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const submission = await SubmissionService.getStudentSubmission(assignmentId, req.user._id);
    return ApiResponse.success(res, 'Student submission retrieved', { submission });
  } catch (err) {
    next(err);
  }
};

export const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email rollNumber')
      .populate('currentVersionId')
      .populate('finalGradeId')
      .sort({ submittedAt: -1 })
      .lean();

    return ApiResponse.success(res, 'Submissions roster retrieved', { items: submissions });
  } catch (err) {
    next(err);
  }
};

export const getSubmissionDetails = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId)
      .populate('studentId', 'name email rollNumber')
      .populate('currentVersionId')
      .populate('finalGradeId')
      .lean();

    return ApiResponse.success(res, 'Submission details retrieved', { submission });
  } catch (err) {
    next(err);
  }
};
