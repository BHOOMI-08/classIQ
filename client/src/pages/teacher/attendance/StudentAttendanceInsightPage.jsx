import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attendanceAnalyticsService } from '../../../services/attendanceAnalyticsService.js';
import { AttendanceHealthCard } from '../../../components/attendance/student/AttendanceHealthCard.jsx';
import { SafeLeaveCard } from '../../../components/attendance/student/SafeLeaveCard.jsx';
import { RecoveryCalculatorCard } from '../../../components/attendance/student/RecoveryCalculatorCard.jsx';
import { AttendanceStatusBadge } from '../../../components/attendance/shared/AttendanceStatusBadge.jsx';
import { User, ArrowLeft, History } from 'lucide-react';

export const StudentAttendanceInsightPage = () => {
  const { classId, studentId } = useParams();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        setLoading(true);
        const res = await attendanceAnalyticsService.getTeacherStudentInsight(classId, studentId);
        setInsight(res?.data || null);
      } catch (err) {
        console.error('Failed to load student insight:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [classId, studentId]);

  if (loading) return <div className="container mx-auto p-6 text-center">Loading student insight...</div>;
  if (!insight) return <div className="container mx-auto p-6 text-center text-muted">Student insight not found.</div>;

  const { student, health, timeline } = insight;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <Link to={`/teacher/classes/${classId}/attendance/analytics`} className="btn-secondary btn-sm flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics</span>
        </Link>
      </div>

      <div className="card p-6 mb-6 flex items-center space-x-4">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
          {student.name ? student.name[0] : 'S'}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-xs text-muted">
            {student.email} | Roll #: {student.rollNumber || 'N/A'} | Section: {student.section || 'N/A'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <AttendanceHealthCard health={health} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SafeLeaveCard safeLeaves={health.safeLeaves} threshold={health.attendanceThreshold} />
          <RecoveryCalculatorCard recoveryClasses={health.recoveryClasses} threshold={health.attendanceThreshold} />
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-lg flex items-center space-x-2 mb-4">
            <History className="w-5 h-5 text-primary" />
            <span>Attendance Session Timeline</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="p-3">Status</th>
                  <th className="p-3">Marked Time</th>
                  <th className="p-3">Late (Mins)</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((t) => (
                  <tr key={t.recordId} className="border-b border-border">
                    <td className="p-3">
                      <AttendanceStatusBadge status={t.status} />
                    </td>
                    <td className="p-3 text-xs">{t.markedAt ? new Date(t.markedAt).toLocaleString() : '-'}</td>
                    <td className="p-3 text-xs">{t.lateByMinutes > 0 ? `${t.lateByMinutes} m` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
