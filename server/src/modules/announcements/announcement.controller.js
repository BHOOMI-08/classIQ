import { AnnouncementService } from './announcement.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const isOwner = req.isOwner || req.user.role === 'teacher' || req.user.role === 'admin';
    const announcements = await AnnouncementService.getAnnouncements(classroomId, isOwner);
    ApiResponse.success(res, { announcements }, 'Announcements fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const announcement = await AnnouncementService.createAnnouncement(
      classroomId,
      req.user,
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.created(res, { announcement }, 'Announcement created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;
    const announcement = await AnnouncementService.updateAnnouncement(
      announcementId,
      req.user,
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, { announcement }, 'Announcement updated successfully');
  } catch (error) {
    next(error);
  }
};

export const publishAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;
    const announcement = await AnnouncementService.publishAnnouncement(
      announcementId,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, { announcement }, 'Announcement published successfully');
  } catch (error) {
    next(error);
  }
};

export const archiveAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;
    const announcement = await AnnouncementService.archiveAnnouncement(
      announcementId,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, { announcement }, 'Announcement archived successfully');
  } catch (error) {
    next(error);
  }
};
