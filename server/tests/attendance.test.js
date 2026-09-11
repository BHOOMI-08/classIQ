import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './setup/database.js';
import { CryptoService } from '../src/services/crypto.service.js';
import { GeolocationService } from '../src/services/geolocation.service.js';
import { SuspicionScoreService } from '../src/modules/attendance/suspicionScore.service.js';
import { User } from '../src/modules/users/user.model.js';
import { Classroom } from '../src/modules/classrooms/classroom.model.js';
import { Enrollment } from '../src/modules/enrollments/enrollment.model.js';
import { AttendanceSession } from '../src/modules/attendance/attendanceSession.model.js';
import { AttendanceRecord } from '../src/modules/attendance/attendanceRecord.model.js';
import { AttendanceCorrection } from '../src/modules/attendance/attendanceCorrection.model.js';

jest.setTimeout(60000);

describe('Module 3: Smart & Secure Attendance Tests', () => {
  beforeAll(async () => {
    await connectTestDb();
  }, 60000);

  afterEach(async () => {
    await clearTestDb();
  }, 60000);

  afterAll(async () => {
    await disconnectTestDb();
  }, 60000);

  describe('Cryptographic Engine & QR Tokens', () => {
    it('should generate canonical payload string with deterministic key ordering', () => {
      const payload = {
        nonce: 'xyz',
        rotation: 1,
        version: 1,
        tokenId: 'tk_123',
        sessionId: 'sess_123',
        classroomId: 'cls_123',
        teacherId: 'teach_123',
        issuedAt: 1000,
        expiresAt: 2000,
      };

      const canonical = CryptoService.serializeCanonicalPayload(payload);
      expect(canonical).toContain('"version":1');
      expect(canonical).toContain('"tokenId":"tk_123"');
    });

    it('should sign and verify valid QR tokens', () => {
      const payload = {
        version: 1,
        tokenId: 'tk_100',
        sessionId: '507f1f77bcf86cd799439011',
        classroomId: '507f1f77bcf86cd799439012',
        teacherId: '507f1f77bcf86cd799439013',
        rotation: 0,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 15000,
        nonce: 'random_nonce_value',
      };

      const tokenString = CryptoService.generateQrToken(payload);
      expect(typeof tokenString).toBe('string');

      const result = CryptoService.verifyQrToken(tokenString);
      expect(result.valid).toBe(true);
      expect(result.payload.tokenId).toBe('tk_100');
    });

    it('should reject tampered QR tokens', () => {
      const payload = {
        version: 1,
        tokenId: 'tk_100',
        sessionId: '507f1f77bcf86cd799439011',
        classroomId: '507f1f77bcf86cd799439012',
        teacherId: '507f1f77bcf86cd799439013',
        rotation: 0,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 15000,
        nonce: 'random_nonce_value',
      };

      const tokenString = CryptoService.generateQrToken(payload);
      const tamperedToken = tokenString.slice(0, -4) + 'AAAA';

      const result = CryptoService.verifyQrToken(tamperedToken);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INVALID_SIGNATURE');
    });
  });

  describe('Geolocation Haversine Engine', () => {
    it('should accurately calculate distance in meters using Haversine formula', () => {
      // Coordinates approx 100 meters apart
      const lat1 = 28.6139;
      const lon1 = 77.209;
      const lat2 = 28.6148;
      const lon2 = 77.209;

      const distance = GeolocationService.calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(90);
      expect(distance).toBeLessThan(110);
    });

    it('should evaluate geofence compliance correctly', () => {
      const teacherCoords = [77.209, 28.6139]; // [lon, lat]
      const studentCoords = [77.209, 28.6141];

      const evaluation = GeolocationService.evaluateGeofence({
        teacherCoords,
        studentCoords,
        accuracyMeters: 5,
        allowedRadiusMeters: 100,
      });

      expect(evaluation.valid).toBe(true);
      expect(evaluation.insideGeofence).toBe(true);
      expect(evaluation.accuracyAcceptable).toBe(true);
    });
  });

  describe('Suspicion Engine', () => {
    it('should calculate weighted suspicion score and return low level for normal submission', () => {
      const result = SuspicionScoreService.calculateScore([]);
      expect(result.score).toBe(0);
      expect(result.level).toBe('low');
      expect(result.recommendedDecision).toBe('accepted');
    });

    it('should assign higher suspicion score for multiple risk signals', () => {
      const signals = [
        'OUTSIDE_GEOFENCE',
        'MULTIPLE_ACCOUNTS_SAME_DEVICE',
      ];

      const result = SuspicionScoreService.calculateScore(signals);
      expect(result.score).toBe(75);
      expect(result.level).toBe('critical');
      expect(result.recommendedDecision).toBe('rejected');
    });
  });

  describe('Attendance Session Lifecycle & Submission APIs', () => {
    let teacherToken;
    let studentToken;
    let teacherUser;
    let studentUser;
    let classroom;

    beforeEach(async () => {
      // Create Teacher User
      teacherUser = await User.create({
        name: 'Dr. Smith',
        email: 'smith@teacher.edu',
        passwordHash: 'hashed_pass',
        role: 'teacher',
        isEmailVerified: true,
      });

      // Create Student User
      studentUser = await User.create({
        name: 'Bob Student',
        email: 'bob@student.edu',
        passwordHash: 'hashed_pass',
        role: 'student',
        isEmailVerified: true,
      });

      // Create Classroom
      classroom = await Classroom.create({
        name: 'Algorithms 101',
        subjectName: 'Computer Science',
        courseCode: 'CS101',
        department: 'CS',
        semester: '4',
        section: 'A',
        joinCode: 'ABC123',
        institution: 'ClassIQ Institute',
        teacherId: teacherUser._id,
        status: 'active',
      });

      // Enroll Student
      await Enrollment.create({
        classroomId: classroom._id,
        studentId: studentUser._id,
        status: 'active',
      });
    });

    it('should start an attendance session and generate initial QR token', async () => {
      // Login teacher to obtain auth cookie/token
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'smith@teacher.edu',
        password: 'password', // Note: login handler checks hash, so let's mock or use register/login endpoint
      });

      // Test session creation directly via service / model
      const { AttendanceSessionService } = await import('../src/modules/attendance/attendanceSession.service.js');

      const { session, qrToken } = await AttendanceSessionService.startSession(
        teacherUser,
        classroom._id,
        { durationMinutes: 15, qrRotationSeconds: 15 }
      );

      expect(session.status).toBe('active');
      expect(session.classroomId.toString()).toBe(classroom._id.toString());
      expect(typeof qrToken).toBe('string');
    });

    it('should handle student submission, duplicate rejection, and automatic absentee marking on session end', async () => {
      const { AttendanceSessionService } = await import('../src/modules/attendance/attendanceSession.service.js');
      const { AttendanceSubmissionService } = await import('../src/modules/attendance/attendanceSubmission.service.js');
      const { AttendanceCorrectionService } = await import('../src/modules/attendance/attendanceCorrection.service.js');

      // 1. Start Session
      const { session, qrToken } = await AttendanceSessionService.startSession(
        teacherUser,
        classroom._id,
        { durationMinutes: 10, qrRotationSeconds: 15 }
      );

      // 2. Submit Attendance as Student
      const subResult = await AttendanceSubmissionService.submitAttendance({
        studentUser,
        tokenString: qrToken,
        devicePayload: { deviceId: 'device_123' },
      });

      expect(subResult.decision).toBe('accepted');
      expect(subResult.status).toBe('present');

      const record = await AttendanceRecord.findOne({ sessionId: session._id, studentId: studentUser._id });
      expect(record).not.toBeNull();
      expect(record.status).toBe('present');

      // 3. Attempt Duplicate Submission (must be blocked)
      await expect(
        AttendanceSubmissionService.submitAttendance({
          studentUser,
          tokenString: qrToken,
          devicePayload: { deviceId: 'device_123' },
        })
      ).rejects.toThrow();

      // 4. Create another student without submission
      const student2 = await User.create({
        name: 'Charlie Student',
        email: 'charlie@student.edu',
        passwordHash: 'hashed_pass',
        role: 'student',
        isEmailVerified: true,
      });

      await Enrollment.create({
        classroomId: classroom._id,
        studentId: student2._id,
        status: 'active',
      });

      // 5. End Session (should auto-mark absent for student2)
      await AttendanceSessionService.endSession(session._id, teacherUser, 'Class completed');

      const absentRecord = await AttendanceRecord.findOne({ sessionId: session._id, studentId: student2._id });
      expect(absentRecord).not.toBeNull();
      expect(absentRecord.status).toBe('absent');
      expect(absentRecord.markSource).toBe('automatic_absence');

      // 6. Correct absent student's status to excused with reason
      const correctionResult = await AttendanceCorrectionService.correctRecord(
        absentRecord._id,
        teacherUser,
        { newStatus: 'excused', reason: 'Student submitted medical certificate' }
      );

      expect(correctionResult.record.status).toBe('excused');

      const history = await AttendanceCorrectionService.getCorrectionHistory(absentRecord._id);
      expect(history.length).toBe(1);
      expect(history[0].previousStatus).toBe('absent');
      expect(history[0].newStatus).toBe('excused');
    });
  });
});
