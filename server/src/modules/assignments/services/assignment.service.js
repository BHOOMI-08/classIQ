import crypto from 'crypto';
import { Assignment } from '../models/assignment.model.js';
import { AssignmentAttachment } from '../models/assignmentAttachment.model.js';
import { AssignmentResource } from '../models/assignmentResource.model.js';
import { Rubric } from '../models/rubric.model.js';
import { RubricCriterion } from '../models/rubricCriterion.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class AssignmentService {
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

  static async createAssignment(data, teacherId) {
    const {
      classroomId,
      title,
      description,
      instructions,
      learningOutcomes,
      topic,
      unit,
      tags,
      difficulty,
      assignmentType,
      totalMarks,
      passingMarks,
      openingAt,
      dueAt,
      closingAt,
      timezone,
      allowLateSubmission,
      latePolicy,
      allowSubmissionReplacement,
      maximumAttempts,
      maximumFiles,
      allowedFileTypes,
      submissionMode,
      scheduledPublishAt,
      status = 'draft',
      rubric,
      linkedResourceIds,
    } = data;

    if (passingMarks > totalMarks) {
      throw ApiError.badRequest('Passing marks cannot exceed total marks');
    }

    const slug = this.generateSlug(title);

    const assignment = await Assignment.create({
      classroomId,
      teacherId,
      title,
      slug,
      description: description || '',
      instructions,
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
      topic: topic || 'General',
      unit: unit || 'Unit 1',
      tags: Array.isArray(tags) ? tags : [],
      difficulty: difficulty || 'medium',
      assignmentType: assignmentType || 'homework',
      totalMarks,
      passingMarks: passingMarks || Math.ceil(totalMarks * 0.4),
      openingAt: openingAt || new Date(),
      dueAt,
      closingAt: closingAt || null,
      timezone: timezone || 'UTC',
      status: scheduledPublishAt ? 'scheduled' : status,
      scheduledPublishAt: scheduledPublishAt || null,
      allowLateSubmission: allowLateSubmission !== false,
      latePolicy: latePolicy || {},
      allowSubmissionReplacement: allowSubmissionReplacement !== false,
      maximumAttempts: maximumAttempts || 3,
      maximumFiles: maximumFiles || 5,
      allowedFileTypes: Array.isArray(allowedFileTypes) ? allowedFileTypes : ['pdf', 'docx', 'txt', 'md'],
      submissionMode: submissionMode || 'file_and_text',
    });

    // Handle optional Rubric creation
    if (rubric && Array.isArray(rubric.criteria) && rubric.criteria.length > 0) {
      const rubricDoc = await Rubric.create({
        assignmentId: assignment._id,
        classroomId,
        teacherId,
        title: `${title} Rubric`,
        totalMarks,
        gradingMethod: 'points',
      });

      for (let i = 0; i < rubric.criteria.length; i++) {
        const c = rubric.criteria[i];
        await RubricCriterion.create({
          rubricId: rubricDoc._id,
          assignmentId: assignment._id,
          title: c.title,
          description: c.description || '',
          maximumMarks: c.maximumMarks,
          order: i + 1,
          levels: c.levels || [],
        });
      }

      assignment.rubricId = rubricDoc._id;
      assignment.hasRubric = true;
      await assignment.save();
    }

    // Handle optional linked Module 4 ContentResources
    if (Array.isArray(linkedResourceIds) && linkedResourceIds.length > 0) {
      for (const resId of linkedResourceIds) {
        await AssignmentResource.create({
          assignmentId: assignment._id,
          classroomId,
          resourceId: resId,
          addedBy: teacherId,
        });
      }
      assignment.linkedResourceCount = linkedResourceIds.length;
      await assignment.save();
    }

    return assignment;
  }

  static async publishAssignment(assignmentId, teacherId) {
    const assignment = await Assignment.findOne({ _id: assignmentId, teacherId });
    if (!assignment) throw ApiError.notFound('Assignment not found');

    assignment.status = 'published';
    assignment.publishedAt = new Date();
    await assignment.save();

    return assignment;
  }

  static async duplicateAssignment(assignmentId, teacherId) {
    const source = await Assignment.findOne({ _id: assignmentId, teacherId });
    if (!source) throw ApiError.notFound('Source assignment not found');

    const dupData = source.toObject();
    delete dupData._id;
    delete dupData.createdAt;
    delete dupData.updatedAt;
    delete dupData.publishedAt;

    dupData.title = `Copy of ${source.title}`;
    dupData.slug = this.generateSlug(dupData.title);
    dupData.status = 'draft';

    const duplicated = await Assignment.create(dupData);
    return duplicated;
  }

  static async archiveAssignment(assignmentId, teacherId) {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, teacherId },
      { $set: { status: 'archived', archivedAt: new Date() } },
      { new: true }
    );
    if (!assignment) throw ApiError.notFound('Assignment not found');
    return assignment;
  }
}
