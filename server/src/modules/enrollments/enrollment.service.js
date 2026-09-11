import mongoose from 'mongoose';
import { Enrollment } from './enrollment.model.js';
import { Classroom } from '../classrooms/classroom.model.js';
import { Schedule } from '../schedules/schedule.model.js';
import { Announcement } from '../announcements/announcement.model.js';
import { StudentProfile } from '../profiles/student-profile.model.js';
import { ApiError } from '../../utils/api-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';
import { normalizeJoinCode } from '../classrooms/classroom.utils.js';

export const EnrollmentService = {
  joinClassroom: async (user, rawCode, ipAddress, userAgent) => {
    if (user.role !== 'student') {
      throw ApiError.forbidden('Only student accounts can join classrooms');
    }

    const joinCode = normalizeJoinCode(rawCode);
    const classroom = await Classroom.findOne({ joinCode });

    if (!classroom) {
      throw ApiError.notFound('Invalid class code. Classroom not found.');
    }

    if (classroom.status === 'archived') {
      throw ApiError.forbidden('This classroom is archived and no longer accepts new students.');
    }

    if (classroom.joinCodeExpiresAt && new Date() > classroom.joinCodeExpiresAt) {
      throw ApiError.forbidden('This class code has expired.');
    }

    // Check capacity if set
    if (classroom.maximumStudents && classroom.maximumStudents > 0) {
      const activeCount = await Enrollment.countDocuments({
        classroomId: classroom._id,
        status: 'active',
      });
      if (activeCount >= classroom.maximumStudents) {
        throw ApiError.conflict('This classroom has reached maximum student capacity.');
      }
    }

    // Check existing enrollment
    let enrollment = await Enrollment.findOne({
      classroomId: classroom._id,
      studentId: user._id,
    });

    if (enrollment) {
      if (enrollment.status === 'active') {
        throw ApiError.conflict('You are already enrolled in this classroom.');
      }
      if (enrollment.status === 'blocked') {
        throw ApiError.forbidden('You have been blocked from rejoining this classroom.');
      }

      // Reactivate previous left or removed enrollment
      enrollment.status = 'active';
      enrollment.joinedAt = new Date();
      enrollment.leftAt = null;
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        classroomId: classroom._id,
        studentId: user._id,
        status: 'active',
        joinedAt: new Date(),
      });
    }

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.STUDENT_JOINED_CLASSROOM,
      ipAddress,
      userAgent,
      metadata: {
        classroomId: classroom._id,
        classroomName: classroom.name,
        joinCode,
      },
    });

    return {
      enrollment,
      classroom: {
        _id: classroom._id,
        name: classroom.name,
        subjectName: classroom.subjectName,
        courseCode: classroom.courseCode,
        department: classroom.department,
        semester: classroom.semester,
        section: classroom.section,
      },
    };
  },

  getStudentClassrooms: async (studentId, query = {}) => {
    const { search, page = 1, limit = 12 } = query;

    const enrollments = await Enrollment.find({
      studentId,
      status: 'active',
    }).lean();

    const classroomIds = enrollments.map((e) => e.classroomId);

    const filter = { _id: { $in: classroomIds }, status: 'active' };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { subjectName: searchRegex },
        { courseCode: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [classrooms, totalItems] = await Promise.all([
      Classroom.find(filter)
        .populate('teacherId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Classroom.countDocuments(filter),
    ]);

    const activeCids = classrooms.map((c) => c._id);

    const [schedules, announcements] = await Promise.all([
      Schedule.find({ classroomId: { $in: activeCids }, isActive: true }).lean(),
      Announcement.find({ classroomId: { $in: activeCids }, status: 'published' })
        .sort({ publishedAt: -1 })
        .lean(),
    ]);

    const scheduleMap = {};
    schedules.forEach((s) => {
      const cid = s.classroomId.toString();
      if (!scheduleMap[cid]) scheduleMap[cid] = [];
      scheduleMap[cid].push(s);
    });

    const announcementMap = {};
    announcements.forEach((a) => {
      const cid = a.classroomId.toString();
      if (!announcementMap[cid]) announcementMap[cid] = a; // latest published
    });

    const enrichedClassrooms = classrooms.map((c) => {
      const cid = c._id.toString();
      return {
        ...c,
        schedules: scheduleMap[cid] || [],
        latestAnnouncement: announcementMap[cid] || null,
      };
    });

    return {
      items: enrichedClassrooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPreviousPage: pageNum > 1,
      },
    };
  },

  leaveClassroom: async (studentId, classroomId, ipAddress, userAgent) => {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    if (!classroom.allowStudentLeave) {
      throw ApiError.forbidden('Leaving this classroom is disabled. Contact your teacher.');
    }

    const enrollment = await Enrollment.findOne({
      classroomId,
      studentId,
      status: 'active',
    });

    if (!enrollment) {
      throw ApiError.notFound('Active enrollment not found for this classroom.');
    }

    enrollment.status = 'left';
    enrollment.leftAt = new Date();
    await enrollment.save();

    await AuditService.log({
      userId: studentId,
      event: AUDIT_EVENTS.STUDENT_LEFT_CLASSROOM,
      ipAddress,
      userAgent,
      metadata: { classroomId, classroomName: classroom.name },
    });

    return { message: 'Successfully left the classroom' };
  },

  getClassroomStudents: async (classroomId, query = {}) => {
    const { search, status = 'active', page = 1, limit = 20 } = query;

    const filter = { classroomId };
    if (status !== 'all') {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [enrollments, totalItems] = await Promise.all([
      Enrollment.find(filter)
        .populate('studentId', 'name email role avatarUrl')
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Enrollment.countDocuments(filter),
    ]);

    const studentUserIds = enrollments.map((e) => e.studentId?._id).filter(Boolean);

    const studentProfiles = await StudentProfile.find({
      userId: { $in: studentUserIds },
    }).lean();

    const profileMap = {};
    studentProfiles.forEach((sp) => {
      profileMap[sp.userId.toString()] = sp;
    });

    let enrichedStudents = enrollments.map((e) => {
      const uid = e.studentId?._id?.toString();
      return {
        ...e,
        studentProfile: profileMap[uid] || null,
      };
    });

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      enrichedStudents = enrichedStudents.filter((item) => {
        const name = item.studentId?.name || '';
        const email = item.studentId?.email || '';
        const roll = item.studentProfile?.rollNumber || '';
        return searchRegex.test(name) || searchRegex.test(email) || searchRegex.test(roll);
      });
    }

    return {
      items: enrichedStudents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
    };
  },

  removeStudent: async (classroomId, studentId, teacherUser, ipAddress, userAgent) => {
    const enrollment = await Enrollment.findOne({ classroomId, studentId });
    if (!enrollment) {
      throw ApiError.notFound('Enrollment record not found');
    }

    enrollment.status = 'removed';
    enrollment.leftAt = new Date();
    await enrollment.save();

    await AuditService.log({
      userId: teacherUser._id,
      event: AUDIT_EVENTS.STUDENT_REMOVED,
      ipAddress,
      userAgent,
      metadata: { classroomId, targetStudentId: studentId },
    });

    return { message: 'Student removed from classroom' };
  },

  blockStudent: async (classroomId, studentId, reason, teacherUser, ipAddress, userAgent) => {
    const enrollment = await Enrollment.findOne({ classroomId, studentId });
    if (!enrollment) {
      throw ApiError.notFound('Enrollment record not found');
    }

    enrollment.status = 'blocked';
    enrollment.blockedAt = new Date();
    enrollment.blockedBy = teacherUser._id;
    enrollment.blockReason = reason || 'Blocked by classroom teacher';
    await enrollment.save();

    await AuditService.log({
      userId: teacherUser._id,
      event: AUDIT_EVENTS.STUDENT_BLOCKED,
      ipAddress,
      userAgent,
      metadata: { classroomId, targetStudentId: studentId, reason: enrollment.blockReason },
    });

    return { message: 'Student blocked from classroom' };
  },

  unblockStudent: async (classroomId, studentId, teacherUser, ipAddress, userAgent) => {
    const enrollment = await Enrollment.findOne({ classroomId, studentId, status: 'blocked' });
    if (!enrollment) {
      throw ApiError.notFound('Blocked student enrollment not found');
    }

    enrollment.status = 'removed';
    enrollment.blockedAt = null;
    enrollment.blockedBy = null;
    enrollment.blockReason = '';
    await enrollment.save();

    await AuditService.log({
      userId: teacherUser._id,
      event: AUDIT_EVENTS.STUDENT_UNBLOCKED,
      ipAddress,
      userAgent,
      metadata: { classroomId, targetStudentId: studentId },
    });

    return { message: 'Student unblocked successfully' };
  },
};
