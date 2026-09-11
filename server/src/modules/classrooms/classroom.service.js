import mongoose from 'mongoose';
import { Classroom } from './classroom.model.js';
import { Enrollment } from '../enrollments/enrollment.model.js';
import { Schedule } from '../schedules/schedule.model.js';
import { Announcement } from '../announcements/announcement.model.js';
import { generateUniqueJoinCode } from './classroom.utils.js';
import { ApiError } from '../../utils/api-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';
import { StudentProfile } from '../profiles/student-profile.model.js';
import { TeacherProfile } from '../profiles/teacher-profile.model.js';

export const ClassroomService = {
  createClassroom: async (user, data, ipAddress, userAgent) => {
    const { schedules, ...classroomData } = data;

    // Fetch teacher profile for default institution if needed
    let institution = classroomData.institution;
    if (!institution) {
      const profile = await TeacherProfile.findOne({ userId: user._id });
      institution = profile?.institution || 'Academic Institution';
    }

    const joinCode = await generateUniqueJoinCode(Classroom);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const classroom = new Classroom({
        ...classroomData,
        teacherId: user._id,
        institution,
        joinCode,
        status: 'active',
      });

      await classroom.save({ session });

      // Create schedule entries if provided
      if (Array.isArray(schedules) && schedules.length > 0) {
        const scheduleDocs = schedules.map((s) => ({
          ...s,
          classroomId: classroom._id,
        }));
        await Schedule.insertMany(scheduleDocs, { session });
      }

      await AuditService.log({
        userId: user._id,
        event: AUDIT_EVENTS.CLASSROOM_CREATED,
        ipAddress,
        userAgent,
        metadata: {
          classroomId: classroom._id,
          name: classroom.name,
          courseCode: classroom.courseCode,
          joinCode: classroom.joinCode,
        },
      });

      await session.commitTransaction();
      session.endSession();

      return classroom;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  getTeacherClassrooms: async (teacherId, query = {}) => {
    const {
      search,
      status = 'active',
      semester,
      department,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter = { teacherId };

    if (status !== 'all') {
      filter.status = status;
    }

    if (semester) {
      filter.semester = semester;
    }

    if (department) {
      filter.department = department;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { subjectName: searchRegex },
        { courseCode: searchRegex },
        { section: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [classrooms, totalItems] = await Promise.all([
      Classroom.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Classroom.countDocuments(filter),
    ]);

    // Attach student count & next schedule to each classroom doc efficiently
    const classroomIds = classrooms.map((c) => c._id);

    const [studentCounts, schedules] = await Promise.all([
      Enrollment.aggregate([
        { $match: { classroomId: { $in: classroomIds }, status: 'active' } },
        { $group: { _id: '$classroomId', count: { $sum: 1 } } },
      ]),
      Schedule.find({ classroomId: { $in: classroomIds }, isActive: true }).lean(),
    ]);

    const countMap = {};
    studentCounts.forEach((sc) => {
      countMap[sc._id.toString()] = sc.count;
    });

    const scheduleMap = {};
    schedules.forEach((s) => {
      const cid = s.classroomId.toString();
      if (!scheduleMap[cid]) scheduleMap[cid] = [];
      scheduleMap[cid].push(s);
    });

    const enrichedClassrooms = classrooms.map((c) => {
      const cid = c._id.toString();
      return {
        ...c,
        studentCount: countMap[cid] || 0,
        schedules: scheduleMap[cid] || [],
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

  getClassroomDetails: async (classroomId, currentUser) => {
    const classroom = await Classroom.findById(classroomId).populate('teacherId', 'name email').lean();
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    const isOwner =
      currentUser.role === 'admin' || classroom.teacherId._id.toString() === currentUser._id.toString();

    // Fetch schedules, student count, and announcements
    const [schedules, studentCount, announcements, userEnrollment] = await Promise.all([
      Schedule.find({ classroomId, isActive: true }).lean(),
      Enrollment.countDocuments({ classroomId, status: 'active' }),
      Announcement.find({
        classroomId,
        ...(isOwner ? { status: { $ne: 'archived' } } : { status: 'published' }),
      })
        .sort({ publishedAt: -1 })
        .populate('teacherId', 'name')
        .lean(),
      currentUser.role === 'student'
        ? Enrollment.findOne({ classroomId, studentId: currentUser._id }).lean()
        : null,
    ]);

    return {
      classroom: {
        ...classroom,
        studentCount,
        schedules,
        announcements,
      },
      userEnrollmentStatus: userEnrollment ? userEnrollment.status : null,
      userEnrollmentDate: userEnrollment ? userEnrollment.joinedAt : null,
      isOwner,
    };
  },

  updateClassroom: async (classroomId, user, updateData, ipAddress, userAgent) => {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    // Explicit field allowlist
    const allowedFields = [
      'name',
      'subjectName',
      'courseCode',
      'department',
      'semester',
      'section',
      'roomNumber',
      'description',
      'institution',
      'attendanceThreshold',
      'maximumStudents',
      'allowStudentLeave',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        classroom[field] = updateData[field];
      }
    });

    await classroom.save();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.CLASSROOM_UPDATED,
      ipAddress,
      userAgent,
      metadata: { classroomId: classroom._id, updatedFields: Object.keys(updateData) },
    });

    return classroom;
  },

  archiveClassroom: async (classroomId, user, ipAddress, userAgent) => {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    classroom.status = 'archived';
    classroom.archivedAt = new Date();
    await classroom.save();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.CLASSROOM_ARCHIVED,
      ipAddress,
      userAgent,
      metadata: { classroomId: classroom._id, name: classroom.name },
    });

    return classroom;
  },

  restoreClassroom: async (classroomId, user, ipAddress, userAgent) => {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    classroom.status = 'active';
    classroom.archivedAt = null;
    await classroom.save();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.CLASSROOM_RESTORED,
      ipAddress,
      userAgent,
      metadata: { classroomId: classroom._id, name: classroom.name },
    });

    return classroom;
  },

  regenerateJoinCode: async (classroomId, user, ipAddress, userAgent) => {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    const oldCode = classroom.joinCode;
    const newCode = await generateUniqueJoinCode(Classroom);

    classroom.joinCode = newCode;
    await classroom.save();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.CLASSROOM_CODE_REGENERATED,
      ipAddress,
      userAgent,
      metadata: { classroomId: classroom._id, oldCode, newCode },
    });

    return { joinCode: newCode, message: 'Classroom join code regenerated successfully' };
  },
};
