import React from 'react';
import { Link } from 'react-router-dom';
import { SessionStatusBadge } from '../shared/SessionStatusBadge.jsx';
import { Radio, Users, Clock, ShieldCheck } from 'lucide-react';

export const ActiveSessionCard = ({ session, classroomId, onEndSession }) => {
  if (!session) return null;

  return (
    <div className="card border border-primary/40 bg-gradient-to-br from-primary/5 via-surface to-surface p-6 shadow-lg my-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-xl font-bold">{session.title || 'Live Attendance Session'}</h3>
            <SessionStatusBadge status={session.status} />
          </div>
          <p className="text-sm text-muted">Started at {new Date(session.startedAt || session.startsAt).toLocaleTimeString()}</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to={`/teacher/classes/${classroomId}/attendance/live`} className="btn-primary flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Open Live Dashboard</span>
          </Link>
          <button onClick={() => onEndSession(session._id)} className="btn-danger">
            End Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-variant/60 border border-border text-center">
        <div>
          <div className="text-2xl font-extrabold text-primary">{session.stats?.accepted || 0}</div>
          <div className="text-xs text-muted font-medium uppercase">Present / Late</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-warning">{session.stats?.pendingReview || 0}</div>
          <div className="text-xs text-muted font-medium uppercase">Pending Review</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-danger">{session.stats?.rejected || 0}</div>
          <div className="text-xs text-muted font-medium uppercase">Rejected</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold">{session.stats?.totalEnrolled || 0}</div>
          <div className="text-xs text-muted font-medium uppercase">Enrolled</div>
        </div>
      </div>
    </div>
  );
};
