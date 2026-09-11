import crypto from 'crypto';
import { ContentResource } from '../models/contentResource.model.js';
import { ResourceVersion } from '../models/resourceVersion.model.js';
import { ContentChunk } from '../models/contentChunk.model.js';
import { ResourceProcessingService } from './resourceProcessing.service.js';
import { ApiError } from '../../../utils/api-error.js';

export class ContentResourceService {
  static generateSlug(title) {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${baseSlug}-${randomSuffix}`;
  }

  /**
   * Create a new Content Resource (File Upload, Text Note, or External Link).
   */
  static async createResource({
    classroomId,
    teacherId,
    title,
    description,
    resourceType,
    moduleId,
    topic,
    unit,
    tags,
    allowDownload,
    file,
    textContent,
    externalUrl,
  }) {
    const slug = this.generateSlug(title);

    const resource = await ContentResource.create({
      classroomId,
      teacherId,
      moduleId: moduleId || null,
      title,
      slug,
      description: description || '',
      resourceType,
      topic: topic || 'General',
      unit: unit || 'Unit 1',
      tags: Array.isArray(tags) ? tags : [],
      allowDownload: allowDownload !== false,
      externalUrl: externalUrl || null,
      status: 'uploaded',
      processingStatus: 'running',
    });

    let checksum = '';
    let fileBuffer = null;

    if (file) {
      fileBuffer = file.buffer;
      checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } else if (textContent) {
      checksum = crypto.createHash('sha256').update(textContent).digest('hex');
    } else {
      checksum = crypto.createHash('sha256').update(externalUrl || title).digest('hex');
    }

    // Create Initial Version
    const version = await ResourceVersion.create({
      resourceId: resource._id,
      classroomId,
      uploadedBy: teacherId,
      versionNumber: 1,
      sourceType: resourceType,
      originalFileName: file ? file.originalname : `${title}.${resourceType === 'text_note' ? 'md' : 'txt'}`,
      mimeType: file ? file.mimetype : 'text/plain',
      fileSizeBytes: file ? file.size : Buffer.byteLength(textContent || '', 'utf8'),
      checksum,
      textContent: textContent || '',
      isCurrent: true,
    });

    resource.currentVersionId = version._id;
    await resource.save();

    // Trigger async processing
    ResourceProcessingService.processResourceVersion({
      resourceId: resource._id,
      versionId: version._id,
      fileBuffer,
    }).catch((err) => {
      console.error('Async resource processing error:', err.message);
    });

    return resource;
  }

  /**
   * Publish a Resource so students can view it.
   */
  static async publishResource(resourceId, teacherId) {
    const resource = await ContentResource.findOne({ _id: resourceId, teacherId });
    if (!resource) throw ApiError.notFound('Resource not found or unauthorized');

    if (resource.status === 'processing') {
      throw ApiError.badRequest('Resource is still processing. Please wait until ready.');
    }

    resource.status = 'published';
    resource.publishedAt = new Date();
    await resource.save();

    return resource;
  }

  /**
   * Unpublish a Resource.
   */
  static async unpublishResource(resourceId, teacherId) {
    const resource = await ContentResource.findOne({ _id: resourceId, teacherId });
    if (!resource) throw ApiError.notFound('Resource not found or unauthorized');

    resource.status = 'unpublished';
    await resource.save();

    return resource;
  }

  /**
   * Replace file version.
   */
  static async replaceFileVersion({ resourceId, teacherId, file, textContent, changeNote }) {
    const resource = await ContentResource.findOne({ _id: resourceId, teacherId });
    if (!resource) throw ApiError.notFound('Resource not found or unauthorized');

    const nextVersionNumber = resource.totalVersions + 1;
    let checksum = '';
    let fileBuffer = null;

    if (file) {
      fileBuffer = file.buffer;
      checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } else {
      checksum = crypto.createHash('sha256').update(textContent || '').digest('hex');
    }

    const version = await ResourceVersion.create({
      resourceId: resource._id,
      classroomId: resource.classroomId,
      uploadedBy: teacherId,
      versionNumber: nextVersionNumber,
      sourceType: resource.resourceType,
      originalFileName: file ? file.originalname : `${resource.title}_v${nextVersionNumber}`,
      mimeType: file ? file.mimetype : 'text/plain',
      fileSizeBytes: file ? file.size : Buffer.byteLength(textContent || '', 'utf8'),
      checksum,
      textContent: textContent || '',
      changeNote: changeNote || `Replaced file version ${nextVersionNumber}`,
      isCurrent: false,
    });

    resource.totalVersions = nextVersionNumber;
    resource.processingStatus = 'running';
    await resource.save();

    ResourceProcessingService.processResourceVersion({
      resourceId: resource._id,
      versionId: version._id,
      fileBuffer,
    }).catch((err) => {
      console.error('Async version replace error:', err.message);
    });

    return version;
  }
}
