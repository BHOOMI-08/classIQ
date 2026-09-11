import { Announcement } from './announcement.model.js';
import { ApiError } from '../../utils/api-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';

export const AnnouncementService = {
  getAnnouncements: async (classroomId, isOwner = false) => {
    const filter = { classroomId };
    if (!isOwner) {
      filter.status = 'published';
    } else {
      filter.status = { $ne: 'archived' };
    }

    return Announcement.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .populate('teacherId', 'name avatarUrl')
      .lean();
  },

  createAnnouncement: async (classroomId, user, data, ipAddress, userAgent) => {
    const announcement = await Announcement.create({
      ...data,
      classroomId,
      teacherId: user._id,
      publishedAt: data.status === 'published' ? new Date() : null,
    });

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.ANNOUNCEMENT_CREATED,
      ipAddress,
      userAgent,
      metadata: { classroomId, announcementId: announcement._id, title: announcement.title },
    });

    return announcement;
  },

  updateAnnouncement: async (announcementId, user, data, ipAddress, userAgent) => {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      throw ApiError.notFound('Announcement not found');
    }

    if (announcement.teacherId.toString() !== user._id.toString() && user.role !== 'admin') {
      throw ApiError.forbidden('You are not authorized to edit this announcement');
    }

    Object.assign(announcement, data);
    announcement.editedAt = new Date();
    await announcement.save();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.ANNOUNCEMENT_UPDATED,
      ipAddress,
      userAgent,
      metadata: { announcementId, title: announcement.title },
    });

    return announcement;
  },

  publishAnnouncement: async (announcementId, user, ipAddress, userAgent) => {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      throw ApiError.notFound('Announcement not found');
    }

    if (announcement.teacherId.toString() !== user._id.toString() && user.role !== 'admin') {
      throw ApiError.forbidden('You are not authorized to publish this announcement');
    }

    announcement.status = 'published';
    announcement.publishedAt = new Date();
    await announcement.save();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.ANNOUNCEMENT_PUBLISHED,
      ipAddress,
      userAgent,
      metadata: { announcementId, title: announcement.title },
    });

    return announcement;
  },

  archiveAnnouncement: async (announcementId, user, ipAddress, userAgent) => {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      throw ApiError.notFound('Announcement not found');
    }

    if (announcement.teacherId.toString() !== user._id.toString() && user.role !== 'admin') {
      throw ApiError.forbidden('You are not authorized to archive this announcement');
    }

    announcement.status = 'archived';
    await announcement.save();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.ANNOUNCEMENT_ARCHIVED,
      ipAddress,
      userAgent,
      metadata: { announcementId, title: announcement.title },
    });

    return announcement;
  },
};
