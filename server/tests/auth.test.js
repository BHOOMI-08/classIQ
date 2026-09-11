import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './setup/database.js';
import { User } from '../src/modules/users/user.model.js';
import { VerificationToken } from '../src/modules/sessions/verification-token.model.js';

jest.setTimeout(60000);

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDb();
  }, 60000);

  afterEach(async () => {
    await clearTestDb();
  }, 60000);

  afterAll(async () => {
    await disconnectTestDb();
  }, 60000);

  const studentData = {
    name: 'Alice Student',
    email: 'alice@student.edu',
    password: 'Password123!',
    studentId: 'STU-1001',
    rollNumber: 'R-1001',
    department: 'Computer Science',
    semester: '5',
    section: 'A',
    institution: 'ClassIQ Institute',
  };

  it('should register a new student successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register/student').send(studentData);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('alice@student.edu');

    const user = await User.findOne({ email: 'alice@student.edu' });
    expect(user).toBeDefined();
    expect(user.role).toBe('student');
    expect(user.isEmailVerified).toBe(false);
  });

  it('should reject registration with duplicate email', async () => {
    await request(app).post('/api/v1/auth/register/student').send(studentData);
    const res = await request(app).post('/api/v1/auth/register/student').send(studentData);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should verify email and allow login', async () => {
    await request(app).post('/api/v1/auth/register/student').send(studentData);
    const user = await User.findOne({ email: 'alice@student.edu' });
    const vTokenDoc = await VerificationToken.findOne({ userId: user._id });

    expect(vTokenDoc).toBeDefined();

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: studentData.email,
      password: studentData.password,
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();
  });

  it('should handle account lockout after 5 failed login attempts', async () => {
    await request(app).post('/api/v1/auth/register/student').send(studentData);

    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/v1/auth/login').send({
        email: studentData.email,
        password: 'WrongPassword123!',
      });
    }

    const res = await request(app).post('/api/v1/auth/login').send({
      email: studentData.email,
      password: studentData.password,
    });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Account locked/);
  });
});
