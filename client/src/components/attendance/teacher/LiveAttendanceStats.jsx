import React from 'react';

export const LiveAttendanceStats = ({ stats = {} }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4">
      <div className="card p-3 text-center border-t-4 border-t-success">
        <div className="text-2xl font-black text-success">{stats.accepted || 0}</div>
        <div className="text-xs text-muted font-semibold uppercase">Present</div>
      </div>
      <div className="card p-3 text-center border-t-4 border-t-warning">
        <div className="text-2xl font-black text-warning">{stats.late || 0}</div>
        <div className="text-xs text-muted font-semibold uppercase">Late</div>
      </div>
      <div className="card p-3 text-center border-t-4 border-t-secondary">
        <div className="text-2xl font-black text-secondary">{stats.pendingReview || 0}</div>
        <div className="text-xs text-muted font-semibold uppercase">Pending</div>
      </div>
      <div className="card p-3 text-center border-t-4 border-t-danger">
        <div className="text-2xl font-black text-danger">{stats.rejected || 0}</div>
        <div className="text-xs text-muted font-semibold uppercase">Rejected</div>
      </div>
      <div className="card p-3 text-center border-t-4 border-t-primary">
        <div className="text-2xl font-black">{stats.totalEnrolled || 0}</div>
        <div className="text-xs text-muted font-semibold uppercase">Enrolled</div>
      </div>
    </div>
  );
};
