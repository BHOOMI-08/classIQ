import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordResetPages';
import { ProfilePage } from './pages/ProfilePage';
import { SecurityPage } from './pages/SecurityPage';
import { SessionsPage } from './pages/SessionsPage';
import { SettingsPage } from './pages/SettingsPage';

import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Module 2 Classroom Pages
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { CreateClassroomPage } from './pages/teacher/CreateClassroomPage';
import { TeacherClassroomPage } from './pages/teacher/TeacherClassroomPage';

import { StudentClassesPage } from './pages/student/StudentClassesPage';
import { JoinClassroomPage } from './pages/student/JoinClassroomPage';
import { StudentClassroomPage } from './pages/student/StudentClassroomPage';

// Module 3 Attendance Pages
import { TeacherAttendancePage } from './pages/teacher/attendance/TeacherAttendancePage';
import { LiveAttendancePage } from './pages/teacher/attendance/LiveAttendancePage';
import { AttendanceHistoryPage } from './pages/teacher/attendance/AttendanceHistoryPage';
import { AttendanceSessionDetailsPage } from './pages/teacher/attendance/AttendanceSessionDetailsPage';
import { AttendanceSecurityPage } from './pages/teacher/attendance/AttendanceSecurityPage';
import { AttendanceAnalyticsPage } from './pages/teacher/attendance/AttendanceAnalyticsPage';
import { StudentAttendanceInsightPage } from './pages/teacher/attendance/StudentAttendanceInsightPage';
import { AttendanceSecurityAnalyticsPage } from './pages/teacher/attendance/AttendanceSecurityAnalyticsPage';
import { AttendanceReportsPage } from './pages/teacher/attendance/AttendanceReportsPage';

import { AttendanceScannerPage } from './pages/student/attendance/AttendanceScannerPage';
import { AttendanceResultPage } from './pages/student/attendance/AttendanceResultPage';
import { StudentAttendanceHistoryPage } from './pages/student/attendance/StudentAttendanceHistoryPage';
import { AttendanceHealthPage } from './pages/student/attendance/AttendanceHealthPage';
import { SubjectAttendanceDetailsPage } from './pages/student/attendance/SubjectAttendanceDetailsPage';
import { AttendanceForecastPage } from './pages/student/attendance/AttendanceForecastPage';

// Module 4 Content & RAG Pages
import { TeacherContentPage } from './pages/teacher/content/TeacherContentPage';
import { CreateResourcePage } from './pages/teacher/content/CreateResourcePage';
import { TeacherResourceDetailsPage } from './pages/teacher/content/TeacherResourceDetailsPage';

import { StudentContentPage } from './pages/student/content/StudentContentPage';
import { StudentResourcePage } from './pages/student/content/StudentResourcePage';
import { ContentSearchPage } from './pages/student/content/ContentSearchPage';
import { BookmarksPage } from './pages/student/content/BookmarksPage';
import { RevisionQueuePage } from './pages/student/content/RevisionQueuePage';

// Module 5 Assignment Pages
import { TeacherAssignmentsPage } from './pages/teacher/assignments/TeacherAssignmentsPage';
import { CreateAssignmentPage } from './pages/teacher/assignments/CreateAssignmentPage';
import { TeacherAssignmentDetailsPage } from './pages/teacher/assignments/TeacherAssignmentDetailsPage';
import { SubmissionsRosterPage } from './pages/teacher/assignments/SubmissionsRosterPage';
import { GradingWorkspacePage } from './pages/teacher/assignments/GradingWorkspacePage';
import { AssignmentAnalyticsPage } from './pages/teacher/assignments/AssignmentAnalyticsPage';

import { StudentAssignmentsPage } from './pages/student/assignments/StudentAssignmentsPage';
import { StudentAssignmentDetailsPage } from './pages/student/assignments/StudentAssignmentDetailsPage';
import { SubmissionDraftPage } from './pages/student/assignments/SubmissionDraftPage';
import { StudentGradeViewPage } from './pages/student/assignments/StudentGradeViewPage';

// Module 6 Quiz & Assessment Engine Pages
import TeacherQuizListPage from './pages/teacher/quizzes/TeacherQuizListPage';
import QuizBuilderPage from './pages/teacher/quizzes/QuizBuilderPage';
import QuizAnalyticsPage from './pages/teacher/quizzes/QuizAnalyticsPage';

import StudentQuizListPage from './pages/student/quizzes/StudentQuizListPage';
import QuizInstructionsPage from './pages/student/quizzes/QuizInstructionsPage';
import TimedQuizAttemptPage from './pages/student/quizzes/TimedQuizAttemptPage';
import QuizResultPage from './pages/student/quizzes/QuizResultPage';

// Module 7 AI Academic Suite Pages
import AITutorPage from './features/ai/pages/AITutorPage';
import StudyPlannerPage from './features/ai/pages/StudyPlannerPage';
import RevisionPage from './features/ai/pages/RevisionPage';
import WeaknessMapPage from './pages/student/ai/WeaknessMapPage';
import TeacherAIToolsPage from './pages/teacher/ai/TeacherAIToolsPage';
import AILecturePlannerPage from './pages/teacher/ai/AILecturePlannerPage';

// Module 8 Classroom Engagement & Intelligence Pages
import TeacherPulsePage from './features/engagement/pages/teacher/TeacherPulsePage';
import TeacherPollsPage from './features/engagement/pages/teacher/TeacherPollsPage';
import TeacherDoubtsPage from './features/engagement/pages/teacher/TeacherDoubtsPage';
import TeacherExitTicketsPage from './features/engagement/pages/teacher/TeacherExitTicketsPage';
import ClassroomTimelinePage from './features/engagement/pages/teacher/ClassroomTimelinePage';
import EngagementAnalyticsPage from './features/engagement/pages/teacher/EngagementAnalyticsPage';
import StudentEngagementPage from './features/engagement/pages/student/StudentEngagementPage';
import ExitTicketAttemptPage from './features/engagement/pages/student/ExitTicketAttemptPage';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const getDashboardRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  };

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={user ? getDashboardRedirect() : <LandingPage />} />

      {/* Public Dedicated Auth Routes */}
      <Route path="/login" element={user ? getDashboardRedirect() : <LoginPage />} />
      <Route path="/register" element={user ? getDashboardRedirect() : <RegisterPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Shared Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/security" element={<SecurityPage />} />
        <Route path="/profile/sessions" element={<SessionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Student Workspaces */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/classes" element={<StudentClassesPage />} />
        <Route path="/student/classes/join" element={<JoinClassroomPage />} />
        <Route path="/student/classes/:classId" element={<StudentClassroomPage />} />
        <Route path="/student/classes/:classId/attendance/analytics" element={<SubjectAttendanceDetailsPage />} />
        <Route path="/student/attendance/scan" element={<AttendanceScannerPage />} />
        <Route path="/student/attendance/result" element={<AttendanceResultPage />} />
        <Route path="/student/attendance/history" element={<StudentAttendanceHistoryPage />} />
        <Route path="/student/attendance/health" element={<AttendanceHealthPage />} />
        <Route path="/student/attendance/forecast" element={<AttendanceForecastPage />} />

        {/* Module 4 Student Content Routes */}
        <Route path="/student/classes/:classId/content" element={<StudentContentPage />} />
        <Route path="/student/resources/:resourceId" element={<StudentResourcePage />} />
        <Route path="/student/content/search" element={<ContentSearchPage />} />
        <Route path="/student/bookmarks" element={<BookmarksPage />} />
        <Route path="/student/revision" element={<RevisionQueuePage />} />

        {/* Module 5 Student Assignment Routes */}
        <Route path="/student/classes/:classId/assignments" element={<StudentAssignmentsPage />} />
        <Route path="/student/assignments/:assignmentId" element={<StudentAssignmentDetailsPage />} />
        <Route path="/student/assignments/:assignmentId/submit" element={<SubmissionDraftPage />} />
        <Route path="/student/submissions/:submissionId/result" element={<StudentGradeViewPage />} />

        {/* Module 6 Student Quiz Routes */}
        <Route path="/student/classes/:classId/quizzes" element={<StudentQuizListPage />} />
        <Route path="/student/classrooms/:classId/quizzes/:quizId/instructions" element={<QuizInstructionsPage />} />
        <Route path="/student/classrooms/:classId/quizzes/:quizId/attempt/:attemptId" element={<TimedQuizAttemptPage />} />
        <Route path="/student/classrooms/:classId/quizzes/:quizId/result/:attemptId" element={<QuizResultPage />} />

        {/* Module 7 Student AI Suite Routes */}
        <Route path="/student/ai-tutor" element={<AITutorPage />} />
        <Route path="/student/study-planner" element={<StudyPlannerPage />} />
        <Route path="/student/weakness-map" element={<WeaknessMapPage />} />
        <Route path="/student/revision" element={<RevisionPage />} />
        <Route path="/student/revision-generator" element={<RevisionPage />} />

        {/* Module 8 Student Engagement Routes */}
        <Route path="/student/classes/:classId/engagement" element={<StudentEngagementPage />} />
        <Route path="/student/exit-tickets/:ticketId/attempt" element={<ExitTicketAttemptPage />} />
      </Route>

      {/* Teacher Workspaces */}
      <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classes" element={<TeacherClassesPage />} />
        <Route path="/teacher/classes/create" element={<CreateClassroomPage />} />
        <Route path="/teacher/classes/:classId" element={<TeacherClassroomPage />} />
        <Route path="/teacher/classes/:classId/attendance" element={<TeacherAttendancePage />} />
        <Route path="/teacher/classes/:classId/attendance/live" element={<LiveAttendancePage />} />
        <Route path="/teacher/classes/:classId/attendance/history" element={<AttendanceHistoryPage />} />
        <Route path="/teacher/classes/:classId/attendance/history/:sessionId" element={<AttendanceSessionDetailsPage />} />
        <Route path="/teacher/classes/:classId/attendance/security" element={<AttendanceSecurityPage />} />
        <Route path="/teacher/classes/:classId/attendance/analytics" element={<AttendanceAnalyticsPage />} />
        <Route path="/teacher/classes/:classId/attendance/students/:studentId" element={<StudentAttendanceInsightPage />} />
        <Route path="/teacher/classes/:classId/attendance/security-analytics" element={<AttendanceSecurityAnalyticsPage />} />
        <Route path="/teacher/classes/:classId/attendance/reports" element={<AttendanceReportsPage />} />

        {/* Module 4 Teacher Content Routes */}
        <Route path="/teacher/classes/:classId/content" element={<TeacherContentPage />} />
        <Route path="/teacher/classes/:classId/content/new" element={<CreateResourcePage />} />
        <Route path="/teacher/resources/:resourceId" element={<TeacherResourceDetailsPage />} />

        {/* Module 5 Teacher Assignment Routes */}
        <Route path="/teacher/classes/:classId/assignments" element={<TeacherAssignmentsPage />} />
        <Route path="/teacher/classes/:classId/assignments/new" element={<CreateAssignmentPage />} />
        <Route path="/teacher/assignments/:assignmentId" element={<TeacherAssignmentDetailsPage />} />
        <Route path="/teacher/assignments/:assignmentId/submissions" element={<SubmissionsRosterPage />} />
        <Route path="/teacher/submissions/:submissionId/grade" element={<GradingWorkspacePage />} />
        <Route path="/teacher/assignments/:assignmentId/analytics" element={<AssignmentAnalyticsPage />} />

        {/* Module 6 Teacher Quiz Routes */}
        <Route path="/teacher/classes/:classId/quizzes" element={<TeacherQuizListPage />} />
        <Route path="/teacher/classes/:classId/quizzes/new" element={<QuizBuilderPage />} />
        <Route path="/teacher/classes/:classId/quizzes/:quizId" element={<QuizBuilderPage />} />
        <Route path="/teacher/classes/:classId/quizzes/:quizId/analytics" element={<QuizAnalyticsPage />} />

        {/* Module 7 Teacher AI Suite Routes */}
        <Route path="/teacher/ai-tools" element={<TeacherAIToolsPage />} />
        <Route path="/teacher/lecture-planner" element={<AILecturePlannerPage />} />

        {/* Module 8 Teacher Engagement Routes */}
        <Route path="/teacher/classes/:classId/pulse" element={<TeacherPulsePage />} />
        <Route path="/teacher/classes/:classId/polls" element={<TeacherPollsPage />} />
        <Route path="/teacher/classes/:classId/doubts" element={<TeacherDoubtsPage />} />
        <Route path="/teacher/classes/:classId/exit-tickets" element={<TeacherExitTicketsPage />} />
        <Route path="/teacher/classes/:classId/timeline" element={<ClassroomTimelinePage />} />
        <Route path="/teacher/classes/:classId/engagement" element={<EngagementAnalyticsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={user ? getDashboardRedirect() : <Navigate to="/" replace />} />
    </Routes>
  );
};

const LayoutContainer = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Hide default top navbar on landing page and dedicated auth pages
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);
  const showAppNavbar = user && !isPublicPage;

  return (
    <div className="app-container">
      {showAppNavbar && <Navbar />}
      <main className={showAppNavbar ? 'main-content' : 'landing-main-wrapper'}>
        <AppRoutes />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}
