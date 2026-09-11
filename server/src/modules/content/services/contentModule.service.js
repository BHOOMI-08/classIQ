import { ContentModule } from '../models/contentModule.model.js';
import { ContentResource } from '../models/contentResource.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class ContentModuleService {
  static async createModule({ classroomId, userId, title, description, unitNumber }) {
    const existingCount = await ContentModule.countDocuments({ classroomId, status: 'active' });
    const moduleDoc = await ContentModule.create({
      classroomId,
      createdBy: userId,
      title,
      description: description || '',
      unitNumber: unitNumber || 1,
      order: existingCount + 1,
      status: 'active',
    });
    return moduleDoc;
  }

  static async getClassroomModules(classroomId, isTeacher = false) {
    const filter = { classroomId };
    if (!isTeacher) {
      filter.status = 'active';
    }
    const modules = await ContentModule.find(filter).sort({ order: 1, createdAt: 1 }).lean();

    // Attach resource counts
    const populated = await Promise.all(
      modules.map(async (mod) => {
        const resourceFilter = { classroomId, moduleId: mod._id };
        if (!isTeacher) resourceFilter.status = 'published';
        const resourceCount = await ContentResource.countDocuments(resourceFilter);
        return { ...mod, resourceCount };
      })
    );

    return populated;
  }

  static async updateModule(moduleId, classroomId, updates) {
    const mod = await ContentModule.findOneAndUpdate(
      { _id: moduleId, classroomId },
      { $set: updates },
      { new: true }
    );
    if (!mod) throw ApiError.notFound('Content module not found');
    return mod;
  }

  static async archiveModule(moduleId, classroomId) {
    const mod = await ContentModule.findOneAndUpdate(
      { _id: moduleId, classroomId },
      { $set: { status: 'archived', isArchived: true, archivedAt: new Date() } },
      { new: true }
    );
    if (!mod) throw ApiError.notFound('Content module not found');
    return mod;
  }

  static async restoreModule(moduleId, classroomId) {
    const mod = await ContentModule.findOneAndUpdate(
      { _id: moduleId, classroomId },
      { $set: { status: 'active', isArchived: false, archivedAt: null } },
      { new: true }
    );
    if (!mod) throw ApiError.notFound('Content module not found');
    return mod;
  }
}
