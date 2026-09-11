import React from 'react';
import { AttendanceProgressBar } from '../shared/AttendanceProgressBar.jsx';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export const AttendanceHealthCard = ({ health }) => {
  if (!health) return null;

  const getStatusBadge = () => {
    switch (health.healthStatus) {
      case 'on_track':
        return <span className="badge badge-success flex items-center space-x-1"><ShieldCheck className="w-3.5 h-3.5" /><span>On Track</span></span>;
      case 'needs_attention':
        return <span className="badge badge-warning flex items-center space-x-1"><AlertTriangle className="w-3.5 h-3.5" /><span>Needs Attention</span></span>;
      case 'at_risk':
        return <span className="badge badge-danger flex items-center space-x-1"><AlertOctagon className="w-3.5 h-3.5" /><span>At Risk</span></span>;
      default:
        return null;
    }
  };

  return (
    <div className="card p-6 my-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold">{health.subjectName || health.classroomName || 'Attendance Health'}</h3>
          <div className="text-xs text-muted">{health.courseCode}</div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="mb-4">
        <AttendanceProgressBar percentage={health.currentPercentage} threshold={health.attendanceThreshold} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
        <div className="p-2 rounded-lg bg-surface-variant/50">
          <div className="text-lg font-black">{health.totalAttended} / {health.totalConducted}</div>
          <div className="text-xs text-muted uppercase">Attended</div>
        </div>
        <div className="p-2 rounded-lg bg-surface-variant/50">
          <div className="text-lg font-black text-danger">{health.absentCount}</div>
          <div className="text-xs text-muted uppercase">Absences</div>
        </div>
        <div className="p-2 rounded-lg bg-surface-variant/50">
          <div className="text-lg font-black text-success">{health.safeLeaves}</div>
          <div className="text-xs text-muted uppercase">Safe Leaves</div>
        </div>
        <div className="p-2 rounded-lg bg-surface-variant/50">
          <div className="text-lg font-black text-warning">{health.recoveryClasses}</div>
          <div className="text-xs text-muted uppercase">Recovery Req.</div>
        </div>
      </div>
    </div>
  );
};
