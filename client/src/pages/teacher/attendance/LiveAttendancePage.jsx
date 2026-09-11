import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useActiveAttendanceSession } from '../../../hooks/useActiveAttendanceSession.js';
import { useTeacherAttendanceSocket } from '../../../hooks/useAttendanceSocket.js';
import { attendanceSessionService } from '../../../services/attendanceSessionService.js';
import { attendanceHistoryService } from '../../../services/attendanceHistoryService.js';
import { attendanceCorrectionService } from '../../../services/attendanceCorrectionService.js';

import { SecureQrDisplay } from '../../../components/attendance/teacher/SecureQrDisplay.jsx';
import { LiveAttendanceStats } from '../../../components/attendance/teacher/LiveAttendanceStats.jsx';
import { LiveAttendanceRoster } from '../../../components/attendance/teacher/LiveAttendanceRoster.jsx';
import { RejectedAttemptsPanel } from '../../../components/attendance/teacher/RejectedAttemptsPanel.jsx';
import { SuspiciousAttemptsPanel } from '../../../components/attendance/teacher/SuspiciousAttemptsPanel.jsx';
import { PendingReviewPanel } from '../../../components/attendance/teacher/PendingReviewPanel.jsx';
import { AttendanceCorrectionModal } from '../../../components/attendance/teacher/AttendanceCorrectionModal.jsx';
import { EndSessionModal } from '../../../components/attendance/teacher/EndSessionModal.jsx';
import { ExportAttendanceModal } from '../../../components/attendance/teacher/ExportAttendanceModal.jsx';

import { ArrowLeft, RefreshCw, Download, Square, Shield } from 'lucide-react';

export const LiveAttendancePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { activeSession, refreshSession } = useActiveAttendanceSession(classId);

  const sessionId = activeSession?._id;

  const { qrData, liveEvents, isConnected } = useTeacherAttendanceSocket(sessionId, classId);

  const [records, setRecords] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [qrToken, setQrToken] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(15);

  const [correctingRecord, setCorrectingRecord] = useState(null);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Fetch Session Data & Roster
  const loadLiveData = useCallback(async () => {
    if (!sessionId) return;
    try {
      const [recRes, attRes, tokenRes] = await Promise.all([
        attendanceHistoryService.getSessionRecords(sessionId),
        attendanceHistoryService.getSessionAttempts(sessionId),
        attendanceSessionService.getCurrentQrToken(sessionId),
      ]);

      setRecords(recRes?.data?.items || []);
      setAttempts(attRes?.data?.items || []);
      setQrToken(tokenRes?.data?.qrToken || '');
      setRemainingSeconds(tokenRes?.data?.remainingSeconds || 15);
    } catch (err) {
      console.error('Error loading live session data:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);

  // Handle Socket Rotation Data
  useEffect(() => {
    if (qrData) {
      setQrToken(qrData.token);
      setRemainingSeconds(qrData.remainingSeconds);
    }
  }, [qrData]);

  // Handle Rotation Countdown Timer locally
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualTokenRefresh = async () => {
    if (sessionId) {
      const res = await attendanceSessionService.getCurrentQrToken(sessionId);
      setQrToken(res?.data?.qrToken || '');
      setRemainingSeconds(res?.data?.remainingSeconds || 15);
    }
  };

  const handleCorrectionSave = async (recordId, payload) => {
    await attendanceCorrectionService.correctRecord(recordId, payload);
    await loadLiveData();
    await refreshSession();
  };

  const handleApprovePending = async (recordId) => {
    await attendanceCorrectionService.correctRecord(recordId, {
      newStatus: 'present',
      reason: 'Teacher approved pending submission',
    });
    await loadLiveData();
    await refreshSession();
  };

  const handleRejectPending = async (recordId) => {
    await attendanceCorrectionService.correctRecord(recordId, {
      newStatus: 'rejected',
      reason: 'Teacher rejected pending submission',
    });
    await loadLiveData();
    await refreshSession();
  };

  const handleEndSession = async (reason) => {
    if (sessionId) {
      await attendanceSessionService.endSession(sessionId, reason);
      navigate(`/teacher/classes/${classId}/attendance`);
    }
  };

  if (!activeSession) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Shield className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
        <h2 className="text-xl font-bold mb-2">No Active Attendance Session</h2>
        <Link to={`/teacher/classes/${classId}/attendance`} className="btn-primary">
          Return to Attendance Hub
        </Link>
      </div>
    );
  }

  const rejectedAttempts = attempts.filter((a) => a.result === 'rejected' || a.decision === 'rejected');
  const suspiciousAttempts = attempts.filter((a) => a.suspicionLevel === 'high' || a.suspicionLevel === 'critical');
  const pendingRecords = records.filter((r) => r.decision === 'pending_review' || r.status === 'pending_review');

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Link to={`/teacher/classes/${classId}/attendance`} className="btn-secondary btn-sm flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Attendance Hub</span>
          </Link>
          <h1 className="text-xl font-bold">{activeSession.title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={loadLiveData} className="btn-secondary btn-sm flex items-center space-x-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button onClick={() => setIsExportModalOpen(true)} className="btn-secondary btn-sm flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button onClick={() => setIsEndModalOpen(true)} className="btn-danger btn-sm flex items-center space-x-1">
            <Square className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Secure QR Display */}
        <div className="lg:col-span-1">
          <SecureQrDisplay
            qrToken={qrToken}
            remainingSeconds={remainingSeconds}
            isConnected={isConnected}
            onRefresh={handleManualTokenRefresh}
          />
        </div>

        {/* Right Column: Live Stats & Overview */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <LiveAttendanceStats stats={activeSession.stats} />

          {/* Pending Reviews Alert Panel */}
          {pendingRecords.length > 0 && (
            <PendingReviewPanel
              pendingRecords={pendingRecords}
              onApprove={handleApprovePending}
              onReject={handleRejectPending}
            />
          )}

          {/* Security Signals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RejectedAttemptsPanel attempts={rejectedAttempts} />
            <SuspiciousAttemptsPanel attempts={suspiciousAttempts} />
          </div>
        </div>
      </div>

      {/* Live Student Roster */}
      <LiveAttendanceRoster records={records} onCorrectRecord={(rec) => setCorrectingRecord(rec)} />

      {/* Modals */}
      <AttendanceCorrectionModal
        isOpen={Boolean(correctingRecord)}
        onClose={() => setCorrectingRecord(null)}
        record={correctingRecord}
        onSave={handleCorrectionSave}
      />

      <EndSessionModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onConfirm={handleEndSession}
      />

      <ExportAttendanceModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
};
