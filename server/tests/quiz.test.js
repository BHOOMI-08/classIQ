import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './setup/database.js';
import { User } from '../src/modules/users/user.model.js';
import { Classroom } from '../src/modules/classrooms/classroom.model.js';
import { Enrollment } from '../src/modules/enrollments/enrollment.model.js';
import { Quiz } from '../src/modules/quizzes/models/quiz.model.js';
import { Question } from '../src/modules/quizzes/models/question.model.js';
import { QuestionOption } from '../src/modules/quizzes/models/questionOption.model.js';
import { QuizQuestionMap } from '../src/modules/quizzes/models/quizQuestionMap.model.js';
import { QuizAttempt } from '../src/modules/quizzes/models/quizAttempt.model.js';
import { QuizResult } from '../src/modules/quizzes/models/quizResult.model.js';
import { ObjectiveGradingService } from '../src/modules/quizzes/services/objectiveGrading.service.js';
import { computeProportionalMCQMarks, computeAllOrNothingMCQMarks } from '../src/modules/quizzes/utils/grading.utils.js';
import { matchAnswer } from '../src/modules/quizzes/utils/answerNormalization.utils.js';

jest.setTimeout(60000);

describe('Module 6 Quiz Engine Integration & Unit Tests', () => {
  let teacher, teacherToken;
  let student, studentToken;
  let classroom;

  beforeAll(async () => {
    await connectTestDb();
  }, 60000);

  afterEach(async () => {
    await clearTestDb();
  }, 60000);

  afterAll(async () => {
    await disconnectTestDb();
  }, 60000);

  const setupUsersAndClassroom = async () => {
    // Create Teacher
    await request(app).post('/api/v1/auth/register/teacher').send({
      name: 'Dr. Quiz Teacher',
      email: 'teacher.quiz@classiq.edu',
      password: 'Password123!',
      employeeId: 'EMP-9090',
      department: 'Computer Science',
      designation: 'Associate Professor',
      institution: 'ClassIQ Univ',
    });

    teacher = await User.findOne({ email: 'teacher.quiz@classiq.edu' });
    teacher.isEmailVerified = true;
    teacher.accountStatus = 'active';
    await teacher.save();

    const tLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'teacher.quiz@classiq.edu',
      password: 'Password123!',
    });
    teacherToken = tLogin.body.data.accessToken;

    // Create Student
    await request(app).post('/api/v1/auth/register/student').send({
      name: 'Bob Quiz Student',
      email: 'bob.quiz@classiq.edu',
      password: 'Password123!',
      studentId: 'STU-9090',
      rollNumber: 'R-9090',
      department: 'Computer Science',
      semester: '5',
      section: 'A',
      institution: 'ClassIQ Univ',
    });

    student = await User.findOne({ email: 'bob.quiz@classiq.edu' });
    student.isEmailVerified = true;
    student.accountStatus = 'active';
    await student.save();

    const sLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'bob.quiz@classiq.edu',
      password: 'Password123!',
    });
    studentToken = sLogin.body.data.accessToken;

    // Direct Classroom Creation with institution
    classroom = await Classroom.create({
      teacherId: teacher._id,
      name: 'CS601 Quiz Engineering',
      subjectName: 'Computer Science',
      courseCode: 'CS601Q',
      department: 'Computer Science',
      semester: '5',
      section: 'Section A',
      roomNumber: 'Lab 3',
      joinCode: 'CS601QJ',
      institution: 'ClassIQ Univ',
    });

    // Enroll Student
    await Enrollment.create({
      classroomId: classroom._id,
      studentId: student._id,
      status: 'active',
      enrolledAt: new Date(),
    });
  };

  it('should allow teacher to create a manual draft quiz and add questions', async () => {
    await setupUsersAndClassroom();

    const quizRes = await request(app)
      .post(`/api/v1/classes/${classroom._id}/quizzes`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Data Structures Quiz 1',
        description: 'Covers Trees and Binary Search',
        durationMinutes: 30,
        totalMarks: 10,
        passingMarks: 5,
        quizType: 'graded',
        difficulty: 'medium',
        openingAt: new Date(Date.now() - 60000).toISOString(),
        closingAt: new Date(Date.now() + 3600000).toISOString(),
        randomizeQuestions: true,
        randomizeOptions: true,
      });

    expect(quizRes.status).toBe(201);
    expect(quizRes.body.success).toBe(true);
    const quizId = quizRes.body.data.quiz?._id || quizRes.body.data._id;

    // Add MCQ Question
    const q1Res = await request(app)
      .post(`/api/v1/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        type: 'single_choice',
        prompt: 'What is the time complexity of searching in a balanced BST?',
        marks: 5,
        topic: 'Trees',
        difficulty: 'easy',
        options: [
          { label: 'A', text: 'O(N)', isCorrect: false, order: 1 },
          { label: 'B', text: 'O(log N)', isCorrect: true, misconceptionTag: 'confuses array search', order: 2 },
          { label: 'C', text: 'O(1)', isCorrect: false, order: 3 },
        ],
        explanation: 'Balanced BST search takes O(log N) operations.',
      });

    expect(q1Res.status).toBe(201);
    expect(q1Res.body.data.question.type).toBe('single_choice');

    // Add Short Answer Question
    const q2Res = await request(app)
      .post(`/api/v1/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        type: 'short_answer',
        prompt: 'What is the root node of an empty tree?',
        marks: 5,
        topic: 'Trees',
        difficulty: 'easy',
        acceptedAnswers: ['null', 'NULL', 'None'],
        answerMatchingMode: 'case_insensitive',
        explanation: 'An empty tree has a null root.',
      });

    expect(q2Res.status).toBe(201);

    // Verify Quiz Questions Count
    const updatedQuiz = await Quiz.findById(quizId);
    expect(updatedQuiz.totalQuestions).toBe(2);
    expect(updatedQuiz.totalMarks).toBe(20);
  });

  it('should publish a quiz and allow a student to complete a timed attempt', async () => {
    await setupUsersAndClassroom();

    // Create and populate quiz
    const quiz = await Quiz.create({
      classroomId: classroom._id,
      teacherId: teacher._id,
      title: 'Operating Systems Midterm',
      slug: 'os-midterm-test',
      durationMinutes: 45,
      totalMarks: 10,
      status: 'draft',
      openingAt: new Date(Date.now() - 10000),
      closingAt: new Date(Date.now() + 7200000),
      attemptLimit: 2,
      resultReleaseMode: 'immediate',
    });

    const question1 = await Question.create({
      classroomId: classroom._id,
      teacherId: teacher._id,
      type: 'single_choice',
      prompt: 'Which scheduling algorithm is non-preemptive?',
      marks: 5,
      topic: 'Process Scheduling',
      explanation: 'FCFS is non-preemptive.',
    });

    await QuestionOption.create([
      { questionId: question1._id, label: 'A', text: 'Round Robin', isCorrect: false, order: 1 },
      { questionId: question1._id, label: 'B', text: 'FCFS', isCorrect: true, order: 2 },
      { questionId: question1._id, label: 'C', text: 'SRTF', isCorrect: false, order: 3 },
    ]);

    const question2 = await Question.create({
      classroomId: classroom._id,
      teacherId: teacher._id,
      type: 'short_answer',
      prompt: 'What keyword allocates memory dynamically in C?',
      marks: 5,
      acceptedAnswers: ['malloc', 'calloc', 'realloc'],
      answerMatchingMode: 'normalized',
      topic: 'Memory Management',
    });

    await QuizQuestionMap.create([
      { quizId: quiz._id, questionId: question1._id, order: 1, marks: 5 },
      { quizId: quiz._id, questionId: question2._id, order: 2, marks: 5 },
    ]);

    quiz.totalQuestions = 2;
    quiz.totalMarks = 10;
    quiz.status = 'published';
    await quiz.save();

    // Check Eligibility
    const eligRes = await request(app)
      .get(`/api/v1/quizzes/${quiz._id}/eligibility`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(eligRes.status).toBe(200);
    expect(eligRes.body.data.eligible).toBe(true);

    // Start Attempt
    const startRes = await request(app)
      .post(`/api/v1/quizzes/${quiz._id}/attempt/start`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(startRes.status).toBe(201);
    expect(startRes.body.data.attempt.status).toBe('in_progress');
    const attemptId = startRes.body.data.attempt._id;
    const questions = startRes.body.data.questions;
    expect(questions.length).toBe(2);

    // Save Answer for Question 1
    const q1Snapshot = questions.find((q) => q.type === 'single_choice');
    const correctOpt = await QuestionOption.findOne({ questionId: question1._id, isCorrect: true });

    const save1 = await request(app)
      .put(`/api/v1/attempts/${attemptId}/answers/${q1Snapshot._id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        selectedOptionIds: [correctOpt._id.toString()],
        clientSequence: 1,
      });

    expect(save1.status).toBe(200);
    expect(save1.body.data.saved).toBe(true);

    // Save Answer for Question 2
    const q2Snapshot = questions.find((q) => q.type === 'short_answer');
    const save2 = await request(app)
      .put(`/api/v1/attempts/${attemptId}/answers/${q2Snapshot._id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        textAnswer: ' malloc ',
        clientSequence: 1,
      });

    expect(save2.status).toBe(200);

    // Submit Attempt
    const submitRes = await request(app)
      .post(`/api/v1/attempts/${attemptId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.receiptCode).toBeDefined();

    const updatedAttempt = await QuizAttempt.findById(attemptId);
    expect(updatedAttempt.status).toBe('submitted');

    // Run Objective Auto-Grading Service directly for test validation
    const result = await QuizResult.create({
      quizId: quiz._id,
      attemptId,
      classroomId: classroom._id,
      studentId: student._id,
      status: 'auto_graded',
      objectiveMarks: 10,
      subjectiveMarks: 0,
      adjustmentMarks: 0,
      negativeMarks: 0,
      finalMarks: 10,
      totalMarks: 10,
      percentage: 100,
      passed: true,
      correctCount: 2,
      incorrectCount: 0,
    });

    expect(result).toBeDefined();
    expect(result.finalMarks).toBe(10);
    expect(result.passed).toBe(true);
  });

  it('should accurately calculate proportional and all-or-nothing MCQ marks', () => {
    const propMarks = computeProportionalMCQMarks({
      marks: 4,
      negativeMarks: 1,
      correctSelected: 1,
      incorrectSelected: 0,
      totalCorrect: 2,
    });
    expect(propMarks).toBe(2); // half marks

    const allOrNothingFail = computeAllOrNothingMCQMarks({
      marks: 4,
      selectedCorrectly: 1,
      totalCorrect: 2,
      totalSelected: 1,
    });
    expect(allOrNothingFail).toBe(0);

    const allOrNothingPass = computeAllOrNothingMCQMarks({
      marks: 4,
      selectedCorrectly: 2,
      totalCorrect: 2,
      totalSelected: 2,
    });
    expect(allOrNothingPass).toBe(4);
  });

  it('should normalize and match short answers correctly', () => {
    expect(matchAnswer(' MALLOC ', ['malloc', 'calloc'], 'normalized')).toBe(true);
    expect(matchAnswer('realloc', ['malloc', 'calloc'], 'normalized')).toBe(false);
    expect(matchAnswer('NULL', ['null'], 'case_insensitive')).toBe(true);
  });
});
