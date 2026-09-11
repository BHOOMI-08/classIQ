import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AttendanceSecurityPage = () => {
  const { classId } = useParams();

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
        <span>Attendance Security & Anti-Proxy Audit</span>
      </h1>
      <p className="text-muted text-sm mb-6">
        Review security signals, geofence compliance, device risk indicators, and flagged proxy attempts.
      </p>

      <div className="card p-6 border-l-4 border-l-info mb-6">
        <h3 className="font-bold text-base mb-1">Security Audit Guidelines</h3>
        <p className="text-xs text-muted">
          All risk indicators are algorithmically generated assistance for teacher review. They serve as audit signals and are not definitive proof of proxy attendance.
        </p>
      </div>

      <div className="card p-8 text-center text-muted">
        No active security anomalies detected for this classroom.
      </div>
    </div>
  );
};
