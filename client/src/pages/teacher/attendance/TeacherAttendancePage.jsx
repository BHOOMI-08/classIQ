import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useActiveAttendanceSession } from '../../../hooks/useActiveAttendanceSession.js';
import { attendanceSessionService } from '../../../services/attendanceSessionService.js';
import classroomService from '../../../services/classroomService.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { StartAttendanceModal } from '../../../components/attendance/teacher/StartAttendanceModal.jsx';
import { ActiveSessionCard } from '../../../components/attendance/teacher/ActiveSessionCard.jsx';
import { EndSessionModal } from '../../../components/attendance/teacher/EndSessionModal.jsx';
import { Shield, Play, History, ShieldAlert, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export const TeacherAttendancePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classroom, setClassroom] = useState(null);
  const [classroomLoading, setClassroomLoading] = useState(true);
  const [classroomError, setClassroomError] = useState(null);

  const { activeSession, loading: sessionLoading, refreshSession } = useActiveAttendanceSession(classId);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [endSessionId, setEndSessionId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchClassroom = async () => {
      if (!classId) {
        setClassroomError('Classroom ID parameter required');
        setClassroomLoading(false);
        return;
      }
      try {
        setClassroomLoading(true);
        setClassroomError(null);
        const res = await classroomService.getClassroomById(classId);
        const fetchedClassroom = res?.data?.classroom || res?.data;
        if (!fetchedClassroom) {
          throw new Error('Classroom not found');
        }

        // Verify teacher ownership / access
        const isOwner = user?.role === 'admin' || (fetchedClassroom.teacherId?._id || fetchedClassroom.teacherId) === user?._id;
        if (!isOwner) {
          throw new Error('You are not authorized to manage attendance for this classroom');
        }

        if (isMounted) {
          setClassroom(fetchedClassroom);
        }
      } catch (err) {
        if (isMounted) {
          setClassroomError(err.message || 'Failed to load classroom details');
        }
      } finally {
        if (isMounted) {
          setClassroomLoading(false);
        }
      }
    };

    fetchClassroom();
    return () => { isMounted = false; };
  }, [classId, user]);

  const handleStartSession = async (payload) => {
    if (!classId || !classroom) {
      throw new Error('Classroom details must be loaded before starting attendance session');
    }

    const res = await attendanceSessionService.startSession(classId, payload);
    const newSession = res?.data?.session || res?.data;

    // Navigate to live attendance workspace immediately
    navigate(`/teacher/classes/${classId}/attendance/live`, { state: { session: newSession } });
  };

  const handleEndSession = async (reason) => {
    if (endSessionId) {
      await attendanceSessionService.endSession(endSessionId, reason);
      setEndSessionId(null);
      await refreshSession();
    }
  };

  // 1. Error state
  if (classroomError) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center">
        <div className="card p-8 border-t-4 border-t-danger shadow-xl bg-surface">
          <AlertCircle className="w-14 h-14 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-danger mb-2">Classroom Access Error</h2>
          <p className="text-sm text-muted mb-6">{classroomError}</p>
          <div className="flex justify-center space-x-3">
            <Link to="/teacher/classes" className="btn-secondary flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Classrooms</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading state
  if (classroomLoading || sessionLoading) {
    return (
      <div className="container mx-auto p-12 text-center max-w-lg flex flex-col items-center">
        <RefreshCw className="w-10 h-10 animate-spin text-primary mb-3" />
        <span className="text-sm font-semibold text-muted">Loading Classroom Attendance Workspace...</span>
      </div>
    );
  }

  const isArchived = classroom?.status === 'archived';

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2 mb-6">
        <Link to={`/teacher/classes/${classId}`} className="btn-secondary btn-sm flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classroom Workspace</span>
        </Link>
      </div>

      {/* Classroom Banner */}
      <div className="card p-6 mb-6 bg-surface border border-border shadow-sm rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="badge badge-primary text-xs font-bold">{classroom?.department}</span>
              <span className="text-xs text-muted font-medium">Sem {classroom?.semester} ({classroom?.section})</span>
              {isArchived && <span className="badge badge-warning text-xs">Archived</span>}
            </div>
            <h1 className="text-2xl font-black flex items-center space-x-2">
              <Shield className="w-7 h-7 text-primary" />
              <span>{classroom?.name} — Attendance Hub</span>
            </h1>
            <p className="text-muted text-xs mt-1">
              Subject: <b>{classroom?.subjectName}</b> • Course Code: <b>{classroom?.courseCode}</b>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/teacher/classes/${classId}/attendance/history`} className="btn-secondary btn-sm flex items-center space-x-1">
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>
            <Link to={`/teacher/classes/${classId}/attendance/security`} className="btn-secondary btn-sm flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Security Audit</span>
            </Link>
            {!activeSession && !isArchived && (
              <button onClick={() => setIsStartModalOpen(true)} className="btn-primary btn-sm flex items-center space-x-1">
                <Play className="w-4 h-4" />
                <span>Start Attendance</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Active Session Content */}
      {activeSession ? (
        <ActiveSessionCard
          session={activeSession}
          classroomId={classId}
          onEndSession={(sid) => setEndSessionId(sid)}
        />
      ) : (
        <div className="card p-8 text-center my-6 flex flex-col items-center bg-surface border border-border rounded-2xl">
          <Shield className="w-16 h-16 text-primary/40 mb-4" />
          <h2 className="text-xl font-bold mb-2">No Active Attendance Session</h2>
          <p className="text-muted text-sm max-w-md mb-6">
            Start a secure attendance session to display rotating QR codes and capture real-time student attendance with optional geofence verification.
          </p>
          {!isArchived ? (
            <button onClick={() => setIsStartModalOpen(true)} className="btn-primary btn-lg flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Start Attendance Now</span>
            </button>
          ) : (
            <div className="badge badge-warning">Cannot start attendance for an archived classroom</div>
          )}
        </div>
      )}

      {/* Modals */}
      <StartAttendanceModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onStart={handleStartSession}
        classroomName={classroom?.name}
      />

      <EndSessionModal
        isOpen={Boolean(endSessionId)}
        onClose={() => setEndSessionId(null)}
        onConfirm={handleEndSession}
      />
    </div>
  );
};
