import { RevisionService } from '../services/revision.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export async function generateRevision(req, res, next) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { classroomId, resourceId, topic, revisionType } = req.body;

    const asset = await RevisionService.generateRevisionAsset(userId, userRole, {
      classroomId,
      resourceId,
      topic,
      revisionType: revisionType || 'revision_pack',
    });

    return ApiResponse.created(res, { asset }, 'Revision pack generated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getRevisions(req, res, next) {
  try {
    const userId = req.user._id;
    const { classroomId } = req.query;

    const assets = await RevisionService.getRevisions(userId, classroomId);

    return ApiResponse.success(res, 200, 'Revision assets retrieved successfully', { assets });
  } catch (error) {
    next(error);
  }
}

export async function getRevisionById(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const asset = await RevisionService.getRevisionById(userId, id);

    return ApiResponse.success(res, 200, 'Revision asset fetched successfully', { asset });
  } catch (error) {
    next(error);
  }
}
