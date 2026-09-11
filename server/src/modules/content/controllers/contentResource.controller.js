import { ContentResourceService } from '../services/contentResource.service.js';
import { ContentResource } from '../models/contentResource.model.js';
import { ResourceVersion } from '../models/resourceVersion.model.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const createResource = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { title, description, resourceType, moduleId, topic, unit, tags, allowDownload, textContent, externalUrl } = req.body;

    const parsedTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags;

    const resource = await ContentResourceService.createResource({
      classroomId: classId,
      teacherId: req.user._id,
      title,
      description,
      resourceType,
      moduleId,
      topic,
      unit,
      tags: parsedTags,
      allowDownload: allowDownload !== 'false',
      file: req.file,
      textContent,
      externalUrl,
    });

    return ApiResponse.created(res, 'Resource created and queued for RAG processing', { resource });
  } catch (err) {
    next(err);
  }
};

export const getClassroomResources = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin';

    const filter = { classroomId: classId };
    if (!isTeacher) {
      filter.status = 'published';
    } else {
      filter.status = { $ne: 'archived' };
    }

    const resources = await ContentResource.find(filter)
      .populate('moduleId', 'title unitNumber')
      .sort({ createdAt: -1 })
      .lean();

    return ApiResponse.success(res, 'Classroom resources retrieved', { items: resources });
  } catch (err) {
    next(err);
  }
};

export const getResourceDetails = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const resource = await ContentResource.findById(resourceId)
      .populate('moduleId', 'title unitNumber')
      .populate('currentVersionId')
      .lean();

    return ApiResponse.success(res, 'Resource details retrieved', { resource });
  } catch (err) {
    next(err);
  }
};

export const publishResource = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const resource = await ContentResourceService.publishResource(resourceId, req.user._id);
    return ApiResponse.success(res, 'Resource published successfully', { resource });
  } catch (err) {
    next(err);
  }
};

export const unpublishResource = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const resource = await ContentResourceService.unpublishResource(resourceId, req.user._id);
    return ApiResponse.success(res, 'Resource unpublished', { resource });
  } catch (err) {
    next(err);
  }
};

export const replaceFileVersion = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { textContent, changeNote } = req.body;
    const version = await ContentResourceService.replaceFileVersion({
      resourceId,
      teacherId: req.user._id,
      file: req.file,
      textContent,
      changeNote,
    });
    return ApiResponse.success(res, 'File version replaced and queued for re-indexing', { version });
  } catch (err) {
    next(err);
  }
};

export const getResourceVersions = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const versions = await ResourceVersion.find({ resourceId }).sort({ versionNumber: -1 }).lean();
    return ApiResponse.success(res, 'Resource versions retrieved', { items: versions });
  } catch (err) {
    next(err);
  }
};
