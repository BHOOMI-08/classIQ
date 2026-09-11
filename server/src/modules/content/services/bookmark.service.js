import { Bookmark } from '../models/bookmark.model.js';

export class BookmarkService {
  static async addBookmark({ studentId, classroomId, resourceId, note }) {
    return Bookmark.findOneAndUpdate(
      { studentId, resourceId },
      { $set: { classroomId, note: note || '' } },
      { upsert: true, new: true }
    );
  }

  static async removeBookmark({ studentId, resourceId }) {
    return Bookmark.findOneAndDelete({ studentId, resourceId });
  }

  static async getStudentBookmarks(studentId) {
    return Bookmark.find({ studentId })
      .populate('resourceId', 'title resourceType topic unit status estimatedReadingMinutes')
      .sort({ createdAt: -1 })
      .lean();
  }
}
