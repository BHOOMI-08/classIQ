import { Rubric } from '../models/rubric.model.js';
import { RubricCriterion } from '../models/rubricCriterion.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class RubricService {
  static async createRubric({ assignmentId, classroomId, teacherId, title, totalMarks, criteria }) {
    if (!Array.isArray(criteria) || criteria.length === 0) {
      throw ApiError.badRequest('Rubric must include at least one criterion');
    }

    const criteriaSum = criteria.reduce((sum, c) => sum + (c.maximumMarks || 0), 0);
    if (criteriaSum !== totalMarks) {
      throw ApiError.badRequest(`Rubric criteria total (${criteriaSum}) must equal total marks (${totalMarks})`);
    }

    const rubric = await Rubric.create({
      assignmentId: assignmentId || null,
      classroomId,
      teacherId,
      title,
      totalMarks,
      status: 'active',
    });

    const createdCriteria = [];
    for (let i = 0; i < criteria.length; i++) {
      const c = criteria[i];
      const critDoc = await RubricCriterion.create({
        rubricId: rubric._id,
        assignmentId: assignmentId || null,
        title: c.title,
        description: c.description || '',
        maximumMarks: c.maximumMarks,
        order: i + 1,
        levels: c.levels || [],
      });
      createdCriteria.push(critDoc);
    }

    return { rubric, criteria: createdCriteria };
  }

  static async getAssignmentRubric(assignmentId) {
    const rubric = await Rubric.findOne({ assignmentId, status: 'active' }).lean();
    if (!rubric) return null;

    const criteria = await RubricCriterion.find({ rubricId: rubric._id }).sort({ order: 1 }).lean();
    return { ...rubric, criteria };
  }
}
