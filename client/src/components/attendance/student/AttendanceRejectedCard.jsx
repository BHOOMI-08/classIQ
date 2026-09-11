import React from 'react';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendanceRejectedCard = ({ message = 'Attendance could not be marked', onRetry }) => {
  return (
    <div className="card p-8 text-center max-w-sm mx-auto my-6 flex flex-col items-center border-t-4 border-t-danger">
      <XCircle className="w-16 h-16 text-danger mb-3" />
      <h2 className="text-xl font-bold text-danger mb-1">Attendance Rejected</h2>
      <p className="text-sm text-muted mb-6">{message}</p>

      <div className="flex flex-col space-y-2 w-full">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary w-full">
            Try Scanning Again
          </button>
        )}
        <Link to="/student/dashboard" className="btn-secondary w-full">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};
