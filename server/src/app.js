import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { sanitizeMongoInput } from './middleware/sanitize.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { metricsCollector } from './metrics/metricsCollector.js';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profiles/profile.routes.js';
import sessionRoutes from './modules/sessions/session.routes.js';

import classroomRoutes from './modules/classrooms/classroom.routes.js';
import enrollmentRoutes from './modules/enrollments/enrollment.routes.js';
import scheduleRoutes from './modules/schedules/schedule.routes.js';
import announcementRoutes from './modules/announcements/announcement.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import attendanceAnalyticsRoutes from './modules/attendance/analytics/attendanceAnalytics.routes.js';
import attendanceReportRoutes from './modules/attendance/reports/attendanceReport.routes.js';

import contentModuleRoutes from './modules/content/routes/contentModule.routes.js';
import contentResourceRoutes from './modules/content/routes/contentResource.routes.js';
import resourceSearchRoutes from './modules/content/routes/resourceSearch.routes.js';
import resourceProgressRoutes from './modules/content/routes/resourceProgress.routes.js';
import bookmarkRoutes from './modules/content/routes/bookmark.routes.js';
import revisionQueueRoutes from './modules/content/routes/revisionQueue.routes.js';
import resourceAIRoutes from './modules/content/routes/resourceAI.routes.js';

import assignmentRoutes from './modules/assignments/routes/assignment.routes.js';
import assignmentAIRoutes from './modules/assignments/routes/assignmentAI.routes.js';
import rubricRoutes from './modules/assignments/routes/rubric.routes.js';
import submissionRoutes from './modules/assignments/routes/submission.routes.js';
import gradingRoutes from './modules/assignments/routes/grading.routes.js';
import deadlineExtensionRoutes from './modules/assignments/routes/deadlineExtension.routes.js';
import assignmentAnalyticsRoutes from './modules/assignments/routes/assignmentAnalytics.routes.js';
import assignmentExportRoutes from './modules/assignments/routes/assignmentExport.routes.js';

import quizRoutes from './modules/quizzes/routes/quiz.routes.js';
import questionRoutes from './modules/quizzes/routes/question.routes.js';
import quizAIRoutes from './modules/quizzes/routes/quizAI.routes.js';
import quizAttemptRoutes from './modules/quizzes/routes/quizAttempt.routes.js';
import quizAnswerRoutes from './modules/quizzes/routes/quizAnswer.routes.js';
import quizGradingRoutes from './modules/quizzes/routes/quizGrading.routes.js';
import quizResultRoutes from './modules/quizzes/routes/quizResult.routes.js';
import quizAnalyticsRoutes from './modules/quizzes/routes/quizAnalytics.routes.js';
import quizExtraRoutes from './modules/quizzes/routes/quizExtra.routes.js';

import aiRoutes from './modules/ai/ai.routes.js';
import engagementRoutes from './modules/engagement/routes/engagement.routes.js';

const app = express();

app.set('trust proxy', 1);

// Request Correlation ID Middleware
app.use(requestIdMiddleware);

// Security Headers with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS & Cookie Parser
app.use(cors(corsOptions));
app.use(cookieParser());

// Metrics collection middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    metricsCollector.incHttpRequest(req.method, route, res.statusCode);
  });
  next();
});

// Body Parsers & Sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeMongoInput);

// Static file serving for uploads
const uploadsPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadsPath));

// Health, Readiness & Metrics Routes
app.use('/', healthRoutes);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/sessions', sessionRoutes);

app.use('/api/v1/classrooms', classroomRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/classrooms/:classId/schedules', scheduleRoutes);
app.use('/api/v1/classrooms/:classId/announcements', announcementRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/attendance/analytics', attendanceAnalyticsRoutes);
app.use('/api/v1/attendance/reports', attendanceReportRoutes);
app.use('/api/v1/classrooms/:classId/attendance', attendanceRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

// Module 4 API Routes
app.use('/api/v1', contentModuleRoutes);
app.use('/api/v1', contentResourceRoutes);
app.use('/api/v1', resourceSearchRoutes);
app.use('/api/v1', resourceProgressRoutes);
app.use('/api/v1', bookmarkRoutes);
app.use('/api/v1', revisionQueueRoutes);
app.use('/api/v1', resourceAIRoutes);

// Module 5 API Routes
app.use('/api/v1', assignmentRoutes);
app.use('/api/v1', assignmentAIRoutes);
app.use('/api/v1', rubricRoutes);
app.use('/api/v1', submissionRoutes);
app.use('/api/v1', gradingRoutes);
app.use('/api/v1', deadlineExtensionRoutes);
app.use('/api/v1', assignmentAnalyticsRoutes);
app.use('/api/v1', assignmentExportRoutes);

// Module 6 API Routes
app.use('/api/v1', quizRoutes);
app.use('/api/v1', questionRoutes);
app.use('/api/v1', quizAIRoutes);
app.use('/api/v1', quizAttemptRoutes);
app.use('/api/v1', quizAnswerRoutes);
app.use('/api/v1', quizGradingRoutes);
app.use('/api/v1', quizResultRoutes);
app.use('/api/v1', quizAnalyticsRoutes);
app.use('/api/v1', quizExtraRoutes);

// Module 7 AI Academic Suite API Routes
app.use('/api/v1/ai', aiRoutes);

// Module 8 Classroom Engagement & Intelligence API Routes
app.use('/api/v1', engagementRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
