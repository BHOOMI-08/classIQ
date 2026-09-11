# ClassIQ — Smart & Secure Classroom Management Platform
## Comprehensive Technical & Architectural Documentation

---

## 1. Executive Summary & System Overview

**ClassIQ** is an end-to-end, enterprise-grade classroom management and intelligent academic platform designed for modern educational institutions. It seamlessly unifies dynamic attendance verification, interactive course management, learning content streaming, AI-assisted evaluation, and real-time student analytics into a single cohesive system.

### Core System Objectives
- **Zero-Trust Smart Attendance**: Prevents proxy attendance using dynamic HMAC-SHA256 rotating QR codes, GPS Haversine geofence verification, device fingerprinting, and IP collision detection.
- **Real-Time Interactive Classrooms**: Instant updates via WebSockets for live attendance status, announcements, and quiz attempts.
- **AI Academic Suite**: Native AI integrations for automated quiz generation, content summarization, assignment grading assistance, and student learning path recommendations.
- **Academic Analytics & Compliance**: In-depth health scores, safe-leave predictors, automated auto-absent tracking, disarmed CSV reports, and official PDF generation.

---

## 2. Technology Stack & System Architecture

```
                                  +-----------------------+
                                  |    React 18 + Vite    |
                                  |  (ClassIQ Frontend)   |
                                  +-----------+-----------+
                                              |
                                HTTP / WS     |  Socket.IO
                                REST APIs     v  Events
                                  +-----------+-----------+
                                  | Express.js Server     |
                                  | (Node.js ESM Runtime) |
                                  +-----+-----+-----+-----+
                                        |     |     |
             +--------------------------+     |     +--------------------------+
             |                                v                                |
+------------+-----------+        +-----------+-----------+        +-----------+-----------+
|    MongoDB Database    |        |   Local File Storage    |        |    ClassIQ AI Suite   |
|   (Mongoose Schemas)   |        |   (/uploads Directory)  |        |    (LLM Services)     |
+------------------------+        +-----------------------+        +-----------------------+
```

### 2.1 Backend Architecture
- **Runtime & Framework**: Node.js (ES Module standard), Express.js v4.19
- **Database Layer**: MongoDB managed via Mongoose v8.5 with strict schema validation, indexes, and soft-delete capabilities.
- **Real-Time Communication**: Socket.IO v4.8 with room-based pub/sub for real-time attendance streaming and live classroom updates.
- **Security & Middleware**:
  - `helmet`: Content Security Policy (CSP), anti-clickjacking, XSS protection headers.
  - `express-rate-limit`: Rate limiting on public and sensitive endpoints.
  - `sanitizeMongoInput`: MongoDB operator injection prevention.
  - `requestIdMiddleware`: Unique correlation ID tracking via `X-Request-ID`.
  - `metricsCollector`: Prom-style internal request metric tracking.
- **Document Generation & Storage**: `pdfkit` for PDF generation, `multer` for secure multi-part file uploads.

### 2.2 Frontend Architecture
- **Framework**: React 18 with Vite build tooling and React Router v6.
- **UI & Icons**: Vanilla CSS design system with CSS custom properties, responsive design tokens, and Lucide React icon library.
- **QR & Scanner Integration**: `qrcode.react` for live dynamic QR generation, `html5-qrcode` for multi-platform camera QR scanning.
- **Data Visualization**: Recharts for dynamic attendance, quiz, and assignment metrics charts.
- **Real-Time Client**: `socket.io-client` with auto-reconnection and event listeners.

---

## 3. Subsystems & Module Breakdown

The ClassIQ system is partitioned into **7 Core Modules**:

```
+-----------------------------------------------------------------------------------+
|                                 ClassIQ Platform                                  |
+---------------+---------------+-------------------+---------------+---------------+
| Module 1      | Module 2      | Module 3          | Module 4      | Module 5      |
| Auth & Security| Classrooms &  | Smart Attendance  | Content &     | Assignments & |
| Governance    | Communication | & Fraud Guard     | Resource Hub  | Submissions   |
+---------------+---------------+-------------------+---------------+---------------+
| Module 6      | Module 7      | System Governance |               |               |
| Quizzes &     | AI Academic   | Metrics, Audit    |               |               |
| Testing       | Assistant     | & Health Monitoring|              |               |
+---------------+---------------+-------------------+---------------+---------------+
```

### Module 1: Authentication, Profiles & Security Governance
- **Authentication**: JWT-based session validation delivered via secure HTTP-only cookies or `Authorization: Bearer` headers.
- **Roles & Permissions**: Fine-grained Role-Based Access Control (`Student`, `Teacher`, `Admin`).
- **Account Verification & Reset**: Email verification flow and secure token-based password reset.
- **Active Session Audit**: Tracks user agent (`ua-parser-js`), IP address, login timestamps, and revoke-session capabilities.

### Module 2: Classrooms, Enrollments & Communication
- **Classroom Management**: Teacher-created virtual classrooms with subject codes, section descriptions, and join codes.
- **Dynamic Join Codes**: Unique enrollment code generation with manual rotation or invalidation options.
- **Enrollment Workflow**: Student join requests, pending approval queues, teacher accept/reject actions, and roster exports.
- **Announcements**: Classroom-wide announcements with rich attachments, comments, and pinned threads.
- **Timetable & Schedules**: Weekly recurring schedule definitions with conflict detection.

### Module 3: Smart Attendance & Real-Time Security System
- **Dynamic HMAC Rotating QR Tokens**:
  - Rotating QR payloads containing `sessionId`, timestamp, expiration, and random nonce, signed via HMAC-SHA256.
  - Automatic rotation every 15 seconds (configurable) via server timer and WebSockets (`attendance:qr-rotated`).
- **GPS Haversine Geofencing**:
  - Computes exact distance between student device GPS and teacher location.
  - Rejects or flags scans exceeding configured geofence radius (e.g., 100 meters).
- **Anti-Fraud Guard**:
  - **IP Collision Detection**: Flags multiple student submissions originating from identical non-institutional IP addresses.
  - **Device Fingerprint Collision**: Detects sharing of physical devices among multiple student accounts.
  - **Speed & Impossible Travel Verification**: Checks distance and time deltas between successive scans.
- **Status Pipeline**: Submissions are automatically evaluated into `accepted`, `pending_review` (flagged), or `rejected`.
- **Auto-Absent Background Worker**: When a session ends, all enrolled students without an `accepted` record are marked `absent`.
- **Analytics & Export Engine**:
  - Calculates student attendance health score, safe leaves allowance, and streak tracking.
  - CSV report generation disarming formula injection attempts (`=`, `+`, `-`, `@` escaping).
  - Production-ready PDF report generation using `pdfkit`.

### Module 4: Content Management & Learning Hub
- **Modular Curriculum**: Classrooms structured into organized learning modules and resources.
- **Resource Processing**: Support for PDFs, lecture documents, videos, external links, and text notes.
- **Progress & Bookmarks**: Tracks individual student resource completion and custom bookmark queues.
- **Revision Queue**: Auto-populates recommended review items based on quiz performance and time elapsed.

### Module 5: Assignments & Automated Evaluation
- **Assignment Builder**: Teachers create assignments with deadline constraints, submission file rules, and custom evaluation rubrics.
- **Submission Engine**: File upload processing via Multer with validation on mime-types and file size limits.
- **Grading & Feedback**: Teachers grade submissions using structured rubrics, leave line-by-line feedback, and return scores.
- **Extensions & Late Submissions**: Late submission handling with automated penalty calculations and manual deadline extension requests.

### Module 6: Quizzes & Assessment Engine
- **Quiz Architect**: Multiple choice, true/false, short answer, and essay question formats.
- **Adaptive Execution**: Time-limited quiz sessions, randomized question/option ordering, and auto-save of draft answers.
- **Auto-Grading Engine**: Instant grading for objective question types with manual teacher override for subjective questions.
- **Analytics**: Item difficulty analysis, average score distribution, and question discrimination index.

### Module 7: ClassIQ AI Academic Suite
- **ClassIQ AI Assistant**: Direct integration with Gemini/LLM services for interactive student tutoring.
- **Automated Quiz Generation**: Generates contextual quiz items directly from uploaded course content or lecture notes.
- **Smart Summarization**: Provides concise bulleted summaries and key takeaway extractions from long course materials.
- **Grading Assistant**: Recommends partial marks and detailed feedback points based on teacher-provided rubrics.

---

## 4. Database Schema & Data Models

The system runs on **12 primary Mongoose collections**:

| Collection Name | Primary Keys & Indexes | Core Purpose |
| :--- | :--- | :--- |
| **`User`** | `email`, `role`, `isEmailVerified` | User identities, credential hashes, profile metadata, roles. |
| **`Classroom`** | `code`, `teacherId`, `subjectCode` | Core classroom container, join code, subject metadata. |
| **`Enrollment`** | `classroomId`, `studentId`, `status` | Student-classroom relationship, pending/accepted status. |
| **`AttendanceSession`**| `classroomId`, `teacherId`, `status` | Live or historical attendance window parameters & geofence rules. |
| **`AttendanceRecord`** | `sessionId`, `studentId`, `status` | Individual student attendance log, GPS coordinates, fraud flags. |
| **`Announcement`** | `classroomId`, `authorId` | Classroom communications, comments, and attachments. |
| **`Schedule`** | `classroomId`, `dayOfWeek` | Weekly timetable slots and room assignments. |
| **`ContentModule`** | `classroomId`, `order` | Topic modules organizing learning resources. |
| **`ContentResource`** | `moduleId`, `resourceType` | Individual study materials (documents, video links, notes). |
| **`Assignment`** | `classroomId`, `dueDate` | Assignment definitions, rubrics, and submission rules. |
| **`AssignmentSubmission`**| `assignmentId`, `studentId` | Submitted work files, student notes, grades, and feedback. |
| **`Quiz`** & **`QuizAttempt`**| `classroomId`, `quizId`, `studentId` | Test configurations, question banks, student answers, and scores. |

---

## 5. API & Real-time WebSockets Specification

### 5.1 Key REST Endpoints Overview

#### Authentication & Profile (`/api/v1/auth`, `/api/v1/profile`)
- `POST /api/v1/auth/register` — Register student or teacher account
- `POST /api/v1/auth/login` — Authenticate and issue HttpOnly JWT cookie
- `POST /api/v1/auth/logout` — Invalidate user session
- `GET /api/v1/profile/me` — Fetch currently authenticated user profile

#### Classrooms & Enrollments (`/api/v1/classrooms`, `/api/v1/enrollments`)
- `POST /api/v1/classrooms` — Create new classroom (Teacher/Admin)
- `POST /api/v1/enrollments/join` — Join classroom using join code (Student)
- `PATCH /api/v1/enrollments/:id/status` — Approve/Reject student enrollment (Teacher)

#### Attendance Subsystem (`/api/v1/attendance`)
- `POST /api/v1/attendance/classrooms/:classId/sessions` — Start new smart session
- `GET /api/v1/attendance/sessions/:sessionId/qr-token` — Get active rotating QR token
- `POST /api/v1/attendance/submit` — Submit scanned QR token with GPS & device fingerprint
- `POST /api/v1/attendance/sessions/:sessionId/end` — Terminate session & run auto-absent worker
- `GET /api/v1/attendance/analytics/me/health` — Student attendance health & streak stats
- `GET /api/v1/attendance/reports/classrooms/:classId/csv` — Export disarmed CSV report
- `GET /api/v1/attendance/reports/classrooms/:classId/pdf` — Export official academic PDF report

#### AI Subsystem (`/api/v1/ai`)
- `POST /api/v1/ai/tutor` — Ask ClassIQ AI assistant academic questions
- `POST /api/v1/ai/summarize` — Generate concise summary of course resource
- `POST /api/v1/ai/generate-quiz` — Auto-generate quiz questions from topic text

---

## 6. Testing, Quality Assurance & Security Status

### 6.1 Automated Test Suite
ClassIQ features a comprehensive test suite using **Jest** and **`mongodb-memory-server`**:

```
-------------------------------+-----------------------+-----------------------------
Test Suite File                | Domain Covered        | Key Verification Points
-------------------------------+-----------------------+-----------------------------
tests/auth.test.js             | User Authentication   | Login, Register, JWT, Pass
tests/attendance.test.js       | Attendance Engine     | QR Signing, Geofence, Scans
tests/attendanceAnalytics.test| Analytics & Health    | Safe Leaves, Streaks, Score
tests/quiz.test.js             | Assessment Engine     | Quiz Attempts, Auto-grading
tests/securityAndPerformance.t| Security & Middleware | Rate Limiting, CSP, Sanitization
tests/ai.test.js               | ClassIQ AI Assistant  | AI Service Response & Guard
-------------------------------+-----------------------+-----------------------------
```

### 6.2 Security Audit & Hardening
- **Formula Injection Shielding**: CSV exports scrub leading `=`, `+`, `-`, `@`, `\t`, `\r` characters.
- **MongoDB Operator Injection**: `sanitizeMongoInput` recursively strips `$key` and `key.with.dots` inputs.
- **XSS & CSP Security Headers**: Helmet middleware configured with restrictive CSP directives for scripts, styles, and web socket connections.
- **HMAC Signatures**: QR tokens cannot be tampered with or pre-generated; rotation token expires strictly after window.

---

## 7. Deployment & Operational Setup

### 7.1 Local Development Quickstart

1. **Clone & Install Dependencies**:
   ```bash
   # Install Backend Dependencies
   cd server && npm install

   # Install Frontend Dependencies
   cd ../client && npm install
   ```

2. **Configure Environment Variables**:
   Create `server/.env` with the following parameters:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/classiq
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   UPLOAD_DIR=uploads
   ```

3. **Start Development Servers**:
   ```bash
   # Terminal 1: Backend Server
   cd server && npm run dev

   # Terminal 2: Frontend Client
   cd client && npm run dev
   ```

---

*ClassIQ — Smart, Secure & Intelligent Educational Infrastructure.*
