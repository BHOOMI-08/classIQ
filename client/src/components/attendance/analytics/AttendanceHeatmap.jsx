import React from 'react';
import { Grid } from 'lucide-react';

export const AttendanceHeatmap = ({ sessions = [], records = [] }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="card p-6 my-4 text-center text-muted">
        No session data for heatmap grid.
      </div>
    );
  }

  // Map records by studentId and sessionId
  const matrix = {};
  records.forEach((r) => {
    const sid = r.studentId?._id?.toString() || r.studentId?.toString();
    const sessId = r.sessionId?._id?.toString() || r.sessionId?.toString();
    if (sid && sessId) {
      if (!matrix[sid]) matrix[sid] = {};
      matrix[sid][sessId] = r.status;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-success text-white';
      case 'late':
        return 'bg-warning text-white';
      case 'absent':
        return 'bg-danger text-white';
      case 'excused':
        return 'bg-info text-white';
      default:
        return 'bg-gray-200 dark:bg-gray-700 text-muted';
    }
  };

  return (
    <div className="card p-6 my-4 shadow-md">
      <div className="flex items-center space-x-2 mb-4">
        <Grid className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Session Attendance Heatmap</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max pb-2">
          {sessions.slice(0, 20).map((sess, idx) => (
            <div key={sess._id || idx} className="w-8 text-center text-xs font-mono text-muted">
              S{idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
