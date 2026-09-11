import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attendanceSessionService } from '../../../services/attendanceSessionService.js';
import { SessionStatusBadge } from '../../../components/attendance/shared/SessionStatusBadge.jsx';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';

export const AttendanceHistoryPage = () => {
  const { classId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Using getActiveSession or custom list call
        const res = await attendanceSessionService.getActiveSession(classId);
        if (res?.data?.session) {
          setSessions([res.data.session]);
        }
      } catch (err) {
        console.error('Failed to load history sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [classId]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <Link to={`/teacher/classes/${classId}/attendance`} className="btn-secondary btn-sm flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Attendance Hub</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold flex items-center space-x-2 mb-6">
        <Calendar className="w-6 h-6 text-primary" />
        <span>Classroom Attendance History</span>
      </h1>

      {loading ? (
        <div className="card p-6 text-center">Loading history...</div>
      ) : sessions.length === 0 ? (
        <div className="card p-8 text-center text-muted">No attendance session history found.</div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => (
            <div key={sess._id} className="card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg">{sess.title}</h3>
                  <SessionStatusBadge status={sess.status} />
                </div>
                <div className="text-xs text-muted mt-1">
                  Started: {new Date(sess.startedAt).toLocaleString()} | Duration: {sess.durationMinutes} mins
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm font-semibold">
                  Present: <span className="text-success">{sess.stats?.accepted || 0}</span> / {sess.stats?.totalEnrolled || 0}
                </div>
                <Link to={`/teacher/classes/${classId}/attendance/history/${sess._id}`} className="btn-secondary btn-sm flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
