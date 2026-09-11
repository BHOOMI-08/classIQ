import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attendanceAnalyticsService } from '../../../services/attendanceAnalyticsService.js';
import { RiskLevelBadge } from '../../../components/attendance/shared/RiskLevelBadge.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AttendanceSecurityAnalyticsPage = () => {
  const { classId } = useParams();
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        setLoading(true);
        const res = await attendanceAnalyticsService.getTeacherSecurity(classId);
        setSecurityData(res?.data || null);
      } catch (err) {
        console.error('Failed to load security analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSecurity();
  }, [classId]);

  if (loading) return <div className="container mx-auto p-6 text-center">Loading security analytics...</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <Link to={`/teacher/classes/${classId}/attendance`} className="btn-secondary btn-sm flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Attendance Hub</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold flex items-center space-x-2 mb-2">
        <ShieldAlert className="w-7 h-7 text-warning" />
        <span>Attendance Security Audit & Attempt Signals</span>
      </h1>
      <p className="text-muted text-sm mb-6">
        Aggregated security rates, rejection statistics, and flagged risk attempts for teacher review.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-black">{securityData?.totalAttempts || 0}</div>
          <div className="text-xs text-muted uppercase">Total Attempts</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-black text-danger">{securityData?.rejectionRate || 0}%</div>
          <div className="text-xs text-muted uppercase">Rejection Rate</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-black text-warning">{securityData?.flagRate || 0}%</div>
          <div className="text-xs text-muted uppercase">Flagged Rate</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-black text-secondary">{securityData?.criticalAttempts || 0}</div>
          <div className="text-xs text-muted uppercase">Critical Flags</div>
        </div>
      </div>
    </div>
  );
};
