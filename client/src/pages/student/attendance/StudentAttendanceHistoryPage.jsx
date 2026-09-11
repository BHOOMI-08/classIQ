import React, { useState, useEffect } from 'react';
import { attendanceHistoryService } from '../../../services/attendanceHistoryService.js';
import { AttendanceStatusBadge } from '../../../components/attendance/shared/AttendanceStatusBadge.jsx';
import { History } from 'lucide-react';

export const StudentAttendanceHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRecords = async () => {
      try {
        setLoading(true);
        const res = await attendanceHistoryService.getMyRecords();
        setRecords(res?.data?.items || []);
      } catch (err) {
        console.error('Failed to load student attendance history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRecords();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <h1 className="text-2xl font-bold flex items-center space-x-2 mb-6">
        <History className="w-6 h-6 text-primary" />
        <span>My Attendance Records</span>
      </h1>

      {loading ? (
        <div className="card p-6 text-center">Loading your attendance records...</div>
      ) : records.length === 0 ? (
        <div className="card p-8 text-center text-muted">No attendance records found for your account.</div>
      ) : (
        <div className="card p-6 overflow-x-auto">
          <table className="table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="p-3">Classroom</th>
                <th className="p-3">Session</th>
                <th className="p-3">Status</th>
                <th className="p-3">Marked At</th>
                <th className="p-3">Late (Mins)</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec._id} className="border-b border-border hover:bg-surface-variant/40">
                  <td className="p-3 font-semibold">{rec.classroomId?.name || 'Classroom'}</td>
                  <td className="p-3 text-xs">{rec.sessionId?.title || 'Session'}</td>
                  <td className="p-3">
                    <AttendanceStatusBadge status={rec.status} />
                  </td>
                  <td className="p-3 text-xs">{rec.markedAt ? new Date(rec.markedAt).toLocaleString() : '-'}</td>
                  <td className="p-3 text-xs">{rec.lateByMinutes > 0 ? `${rec.lateByMinutes} m` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
