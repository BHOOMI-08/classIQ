# ClassIQ — Smart & Secure Attendance API & Socket.IO Specification

Complete specification of REST endpoints and real-time Socket.IO events for ClassIQ Module 3.

---

## 1. Authentication & Security Headers

All requests require HTTP-only JWT Cookie or `Authorization: Bearer <token>` header. Response payloads include `X-Request-ID` correlation tracking header.

---

## 2. Session Lifecycle REST Endpoints

### `POST /api/v1/attendance/classrooms/:classroomId/sessions`
- **Role**: Teacher, Admin
- **Description**: Starts a new smart attendance session for a classroom.
- **Request Body**:
  ```json
  {
    "durationMinutes": 10,
    "qrRotationSeconds": 15,
    "locationRequired": true,
    "teacherLocation": { "latitude": 28.6139, "longitude": 77.209 },
    "geofenceRadiusMeters": 100,
    "lateAfterMinutes": 5
  }
  ```
- **Response**: `201 Created` with created `AttendanceSession` document and initial rotating QR token.

### `GET /api/v1/attendance/classrooms/:classroomId/active-session`
- **Role**: Teacher, Student, Admin
- **Description**: Returns active attendance session metadata for classroom.

### `GET /api/v1/attendance/sessions/:sessionId/qr-token`
- **Role**: Teacher, Admin (Owner)
- **Description**: Fetches current HMAC-SHA256 signed rotating QR token.

### `POST /api/v1/attendance/sessions/:sessionId/end`
- **Role**: Teacher, Admin (Owner)
- **Description**: Ends attendance session immediately, invalidates active QR code, and triggers auto-absent marking.

---

## 3. Student Attendance Submission Endpoints

### `POST /api/v1/attendance/submit`
- **Role**: Student
- **Description**: Submits scanned HMAC-SHA256 QR token with GPS location and device fingerprint.
- **Request Body**:
  ```json
  {
    "token": "<base64url_payload>.<base64url_signature>",
    "location": { "latitude": 28.6139, "longitude": 77.209, "accuracyMeters": 12 },
    "device": { "deviceId": "dev_908234", "platform": "web" }
  }
  ```
- **Response**: `200 OK` with decision: `"accepted"`, `"pending_review"`, or `"rejected"`.

---

## 4. Analytics & Reports REST Endpoints

### `GET /api/v1/attendance/analytics/me/health`
- **Role**: Student
- **Description**: Calculates overall attendance percentage, safe leaves allowance, recovery classes required, and streaks.

### `GET /api/v1/attendance/analytics/classrooms/:classroomId/overview`
- **Role**: Teacher, Admin (Owner)
- **Description**: Returns classroom aggregate metrics, threshold distribution, late arrival rate, and security signal summary.

### `GET /api/v1/attendance/reports/classrooms/:classroomId/csv`
- **Role**: Teacher, Admin (Owner)
- **Description**: Downloads formula-injection disarmed CSV spreadsheet report.

### `GET /api/v1/attendance/reports/classrooms/:classroomId/pdf`
- **Role**: Teacher, Admin (Owner)
- **Description**: Downloads PDFKit-generated official academic PDF document.

---

## 5. Socket.IO Real-Time Event Specification

### Server Emitted Events
- `attendance:qr-rotated`: Broadcasts updated rotating QR token every 15s (`{ sessionId, token, remainingSeconds }`).
- `attendance:joined`: Emitted when student attendance is accepted (`{ sessionId, record }`).
- `attendance:flagged`: Emitted when submission is flagged for teacher review.
- `attendance:session-ended`: Emitted on session termination.

### Client Subscriptions
- `attendance:subscribe-teacher`: Enters teacher live session room (`attendance:session:{sessionId}:teacher`).
- `attendance:subscribe-student`: Enters student private status room (`attendance:session:{sessionId}:student:{studentId}`).
