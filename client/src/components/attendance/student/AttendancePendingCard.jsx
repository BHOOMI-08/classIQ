import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendancePendingCard = () => {
  return (
    <div className="card p-8 text-center max-w-sm mx-auto my-6 flex flex-col items-center border-t-4 border-t-warning">
      <HelpCircle className="w-16 h-16 text-warning mb-3" />
      <h2 className="text-xl font-bold text-warning mb-1">Pending Teacher Review</h2>
      <p className="text-sm text-muted mb-6">
        Your attendance submission was received and flagged for teacher review due to location or security policy verification.
      </p>

      <Link to="/student/attendance/history" className="btn-primary w-full">
        Check Attendance Status
      </Link>
    </div>
  );
};
