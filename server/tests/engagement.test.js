import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './setup/database.js';
import { User } from '../src/modules/users/user.model.js';
import { Classroom } from '../src/modules/classrooms/classroom.model.js';
import { Enrollment } from '../src/modules/enrollments/enrollment.model.js';
import { TokenService } from '../src/services/token.service.js';
import { calculateConfidenceIndex, calculateDoubtPriorityScore, calculateTopicConfusionScore } from '../src/modules/engagement/utils/engagementScoring.utils.js';
import { calculateKeywordSimilarity } from '../src/modules/engagement/utils/textSimilarity.utils.js';

jest.setTimeout(60000);

describe('Module 8: Classroom Engagement & Intelligence Unit & Integration Tests', () => {
  let teacherToken = '';
  let studentToken = '';
  let teacherUser = null;
  let studentUser = null;
  let classroom = null;

  beforeAll(async () => {
    await connectTestDb();

    // Create Teacher & Student Users
    teacherUser = await User.create({
      name: 'Prof Engage',
      email: 'teacher.engage@classiq.edu',
      passwordHash: 'hashedpassword123',
      role: 'teacher',
      accountStatus: 'active',
      isEmailVerified: true,
    });

    studentUser = await User.create({
      name: 'Student Interactive',
      email: 'student.interactive@classiq.edu',
      passwordHash: 'hashedpassword123',
      role: 'student',
      accountStatus: 'active',
      isEmailVerified: true,
    });

    teacherToken = TokenService.generateAccessToken({ userId: teacherUser._id, role: 'teacher' });
    studentToken = TokenService.generateAccessToken({ userId: studentUser._id, role: 'student' });

    // Create Classroom & Enrollment
    classroom = await Classroom.create({
      teacherId: teacherUser._id,
      name: 'Interactive Physics 101',
      subjectName: 'Physics',
      courseCode: 'PHYS88',
      department: 'Physics Dept',
      semester: 'Spring 2026',
      section: 'Sec A',
      institution: 'ClassIQ Univ',
      joinCode: 'PHYS8888',
    });

    await Enrollment.create({
      classroomId: classroom._id,
      studentId: studentUser._id,
      status: 'active',
    });
  }, 60000);

  afterAll(async () => {
    await clearTestDb();
    await disconnectTestDb();
  }, 60000);

  describe('1. Scoring & Math Utilities Unit Tests', () => {
    it('should calculate deterministic Confidence Index correctly', () => {
      const result = calculateConfidenceIndex({
        confused: 2,        // 2 * 0 = 0
        partially_clear: 4, // 4 * 1 = 4
        clear: 8,           // 8 * 2 = 16
        can_explain: 6,     // 6 * 3 = 18
      });

      expect(result.confidenceIndex).toBe(63);
      expect(result.label).toBe('mostly_clear');
      expect(result.totalResponses).toBe(20);
    });

    it('should calculate Doubt Priority Score correctly', () => {
      const score = calculateDoubtPriorityScore({
        upvoteCount: 5,         // 5 * 3 = 15
        similarDoubtCount: 2,   // 2 * 2 = 4
        createdAt: new Date(),
        isUnresolved: true,
      });

      expect(score).toBeGreaterThan(19);
    });

    it('should calculate Topic Confusion Score correctly', () => {
      const result = calculateTopicConfusionScore({
        quizErrorRate: 80,
        exitTicketErrorRate: 70,
        pulseConfusionRate: 60,
        doubtIntensity: 50,
        revisionFrequency: 40,
      });

      expect(result.confusionScore).toBe(65);
      expect(result.classification).toBe('high');
    });

    it('should calculate keyword text similarity accurately', () => {
      const sim = calculateKeywordSimilarity(
        'What is Newton second law of motion?',
        'Can someone explain Newton 2nd law of motion?'
      );

      expect(sim).toBeGreaterThan(0.3);
    });
  });

  describe('2. Classroom Pulse API Integration Tests', () => {
    let pulseId = null;

    it('should allow teacher to start a confidence pulse', async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${classroom._id}/pulses`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          topic: 'Quantum Mechanics Overview',
          prompt: 'How confident are you with wave-particle duality?',
          durationMinutes: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.pulse).toBeDefined();
      expect(res.body.data.pulse.status).toBe('active');
      pulseId = res.body.data.pulse._id;
    });

    it('should allow fetching live pulse distribution', async () => {
      const res = await request(app)
        .get(`/api/v1/pulses/${pulseId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.counts).toBeDefined();
    });
  });

  describe('3. Live Polls API Integration Tests', () => {
    let pollId = null;

    it('should allow teacher to create a live MCQ poll', async () => {
      const res = await request(app)
        .post(`/api/v1/classes/${classroom._id}/polls`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          question: 'What is the SI unit of force?',
          type: 'single_choice',
          options: [
            { text: 'Newton', isCorrect: true },
            { text: 'Joule', isCorrect: false },
            { text: 'Watt', isCorrect: false },
            { text: 'Pascal', isCorrect: false },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.poll).toBeDefined();
      pollId = res.body.data.poll._id;
    });

    it('should start poll and strip answer key from options for students', async () => {
      const res = await request(app)
        .post(`/api/v1/polls/${pollId}/start`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ durationMinutes: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.options[0].isCorrect).toBeUndefined();
    });
  });
});
