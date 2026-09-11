import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attendanceHistoryService } from '../../../services/attendanceHistoryService.js';
import { attendanceCorrectionService } from '../../../services/attendanceCorrectionService.js';
import { LiveAttendanceRoster } from '../../../components/attendance/teacher/LiveAttendanceRoster.jsx';
import { AttendanceCorrectionModal } from '../../../components/attendance/teacher/AttendanceCorrectionModal.jsx';
import { ArrowLeft, FileText } from 'lucide-react';

export const AttendanceSessionDetailsPage = () => {
  const { classId, sessionId } = useParams();
  const [records, setRecords] = useState([]);
  const [correctingRecord, setCorrectingRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await attendanceHistoryService.getSessionRecords(sessionId);
      setRecords(res?.data?.items || []);
    } catch (err) {
      console.error('Failed to load session details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [sessionId]);

  const handleCorrectionSave = async (recordId, payload) => {
    await attendanceCorrectionService.correctRecord(recordId, payload);
    await loadRecords();
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex items-center space-x-2 mb-6">
        <Link to={`/teacher/classes/${classId}/attendance/history`} className="btn-secondary btn-sm flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold flex items-center space-x-2 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <span>Session Attendance Details</span>
      </h1>

      {loading ? (
        <div className="card p-6 text-center">Loading session records...</div>
      ) : (
        <LiveAttendanceRoster records={records} onCorrectRecord={(rec) => setCorrectingRecord(rec)} />
      )}

      <AttendanceCorrectionModal
        isOpen={Boolean(correctingRecord)}
        onClose={() => setCorrectingRecord(null)}
        record={correctingRecord}
        onSave={handleCorrectionSave}
      />
    </div>
  );
};
