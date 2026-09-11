import crypto from 'crypto';
import { Submission } from '../models/submission.model.js';
import { SubmissionVersion } from '../models/submissionVersion.model.js';
import { SubmissionFile } from '../models/submissionFile.model.js';
import { Assignment } from '../models/assignment.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { DeadlineService } from './deadline.service.js';
import { ApiError } from '../../../utils/api-error.js';

export class SubmissionService {
  /**
   * Save or update student draft submission.
   */
  static async saveDraft({ assignmentId, studentId, submissionText, submissionNote, externalLink, files }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw ApiError.notFound('Assignment not found');

    const enrollment = await Enrollment.findOne({ classroomId: assignment.classroomId, studentId, status: 'active' });
    if (!enrollment) throw ApiError.forbidden('You are not enrolled in this classroom');

    if (assignment.status !== 'published' && assignment.status !== 'active') {
      throw ApiError.forbidden('Assignment is not open for submission');
    }

    const deadlineInfo = await DeadlineService.resolveEffectiveDeadline({ assignment, studentId });

    let submission = await Submission.findOne({ assignmentId, studentId });
    if (!submission) {
      submission = await Submission.create({
        assignmentId,
        classroomId: assignment.classroomId,
        studentId,
        status: 'draft',
        submissionText: submissionText || '',
        submissionNote: submissionNote || '',
        externalLink: externalLink || null,
        deadlineUsed: deadlineInfo.effectiveDueAt,
        deadlineExtensionId: deadlineInfo.extensionId,
      });
    } else {
      submission.submissionText = submissionText || submission.submissionText;
      submission.submissionNote = submissionNote || submission.submissionNote;
      submission.externalLink = externalLink || submission.externalLink;
      await submission.save();
    }

    return submission;
  }

  /**
   * Finalize Student Submission attempt.
   */
  static async finalizeSubmission({ assignmentId, studentId, submissionText, submissionNote, externalLink, files }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw ApiError.notFound('Assignment not found');

    const enrollment = await Enrollment.findOne({ classroomId: assignment.classroomId, studentId, status: 'active' });
    if (!enrollment) throw ApiError.forbidden('You are not enrolled in this classroom');

    if (assignment.status !== 'published' && assignment.status !== 'active') {
      throw ApiError.forbidden('Assignment is not currently open for submissions');
    }

    let submission = await Submission.findOne({ assignmentId, studentId });
    const currentAttemptCount = submission ? submission.totalAttempts : 0;

    if (currentAttemptCount >= assignment.maximumAttempts && submission?.status === 'submitted') {
      throw ApiError.badRequest(`Maximum attempt limit (${assignment.maximumAttempts}) reached`);
    }

    const now = new Date();
    const deadlineInfo = await DeadlineService.resolveEffectiveDeadline({ assignment, studentId });
    const lateStatus = DeadlineService.calculateLateStatus(now, deadlineInfo.effectiveDueAt);

    if (lateStatus.isLate && !assignment.allowLateSubmission) {
      throw ApiError.badRequest('Submission deadline has passed and late submissions are blocked');
    }

    const nextAttemptNumber = currentAttemptCount + 1;
    const nextVersionNumber = submission ? (submission.attemptNumber || 0) + 1 : 1;

    // Generate SHA-256 Checksum for submission contents
    const textHashPayload = `${submissionText || ''}:${submissionNote || ''}:${now.toISOString()}`;
    const checksum = crypto.createHash('sha256').update(textHashPayload).digest('hex');

    // Create Immutable Version
    const version = await SubmissionVersion.create({
      submissionId: submission ? submission._id : new mongoose.Types.ObjectId(),
      assignmentId,
      classroomId: assignment.classroomId,
      studentId,
      versionNumber: nextVersionNumber,
      attemptNumber: nextAttemptNumber,
      submissionText: submissionText || '',
      submissionNote: submissionNote || '',
      externalLink: externalLink || null,
      submittedAt: now,
      isFinal: true,
      isLate: lateStatus.isLate,
      lateByMinutes: lateStatus.lateByMinutes,
      deadlineUsed: deadlineInfo.effectiveDueAt,
      checksum,
    });

    // Save Submission Files if any
    const createdFiles = [];
    if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        const fileChecksum = crypto.createHash('sha256').update(f.buffer).digest('hex');
        const fileDoc = await SubmissionFile.create({
          submissionVersionId: version._id,
          submissionId: version.submissionId,
          assignmentId,
          classroomId: assignment.classroomId,
          studentId,
          originalFileName: f.originalname,
          storageProvider: 'local',
          fileUrl: `/uploads/submissions/${f.originalname}`,
          mimeType: f.mimetype,
          fileExtension: f.originalname.split('.').pop()?.toLowerCase() || 'bin',
          fileSizeBytes: f.size,
          checksum: fileChecksum,
        });
        createdFiles.push(fileDoc);
      }
    }

    // Generate Receipt Code via crypto
    const receiptCode = `RC-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Create or Update Master Submission Record
    const finalStatus = lateStatus.isLate ? 'late' : 'submitted';

    if (!submission) {
      submission = await Submission.create({
        _id: version.submissionId,
        assignmentId,
        classroomId: assignment.classroomId,
        studentId,
        currentVersionId: version._id,
        status: finalStatus,
        attemptNumber: nextAttemptNumber,
        totalAttempts: nextAttemptNumber,
        submittedAt: now,
        firstSubmittedAt: now,
        lastSubmittedAt: now,
        isLate: lateStatus.isLate,
        lateByMinutes: lateStatus.lateByMinutes,
        deadlineUsed: deadlineInfo.effectiveDueAt,
        deadlineExtensionId: deadlineInfo.extensionId,
        submissionText: submissionText || '',
        submissionNote: submissionNote || '',
        externalLink: externalLink || null,
        receiptCode,
      });
    } else {
      submission.currentVersionId = version._id;
      submission.status = finalStatus;
      submission.attemptNumber = nextAttemptNumber;
      submission.totalAttempts = nextAttemptNumber;
      submission.submittedAt = now;
      submission.lastSubmittedAt = now;
      submission.isLate = lateStatus.isLate;
      submission.lateByMinutes = lateStatus.lateByMinutes;
      submission.submissionText = submissionText || submission.submissionText;
      submission.submissionNote = submissionNote || submission.submissionNote;
      submission.externalLink = externalLink || submission.externalLink;
      submission.receiptCode = receiptCode;
      await submission.save();
    }

    // Increment assignment counters
    await Assignment.findByIdAndUpdate(assignmentId, {
      $inc: {
        totalSubmissions: 1,
        ...(lateStatus.isLate ? { lateSubmissions: 1 } : {}),
      },
    });

    return {
      submission,
      version,
      files: createdFiles,
      receiptCode,
    };
  }

  static async getStudentSubmission(assignmentId, studentId) {
    const submission = await Submission.findOne({ assignmentId, studentId })
      .populate('currentVersionId')
      .populate('finalGradeId')
      .lean();

    if (!submission) return null;

    let files = [];
    if (submission.currentVersionId) {
      files = await SubmissionFile.find({ submissionVersionId: submission.currentVersionId._id }).lean();
    }

    return { ...submission, files };
  }
}
