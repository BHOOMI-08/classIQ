import { BookmarkService } from '../services/bookmark.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const addBookmark = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { note } = req.body;
    const bookmark = await BookmarkService.addBookmark({
      studentId: req.user._id,
      classroomId: req.resource.classroomId,
      resourceId,
      note,
    });
    return ApiResponse.created(res, 'Bookmark added', { bookmark });
  } catch (err) {
    next(err);
  }
};

export const removeBookmark = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    await BookmarkService.removeBookmark({
      studentId: req.user._id,
      resourceId,
    });
    return ApiResponse.success(res, 'Bookmark removed');
  } catch (err) {
    next(err);
  }
};

export const getStudentBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await BookmarkService.getStudentBookmarks(req.user._id);
    return ApiResponse.success(res, 'Bookmarks retrieved', { items: bookmarks });
  } catch (err) {
    next(err);
  }
};
