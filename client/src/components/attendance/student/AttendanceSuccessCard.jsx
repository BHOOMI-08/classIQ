import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendanceSuccessCard = ({ resultData }) => {
  const isLate = resultData?.status === 'late';

  return (
    <div className="card p-8 text-center max-w-sm mx-auto my-6 flex flex-col items-center border-t-4 border-t-success">
      <CheckCircle2 className="w-16 h-16 text-success mb-3" />
      <h2 className="text-2xl font-black text-success mb-1">
        {isLate ? 'Marked as Late' : 'Attendance Marked!'}
      </h2>
      <p className="text-sm text-muted mb-4">
        {isLate
          ? `Your attendance was accepted but recorded as Late (${resultData?.lateByMinutes || 0} mins after start).`
          : 'Your presence was verified successfully and recorded on the live roster.'}
      </p>

      <div className="w-full p-3 rounded-xl bg-surface-variant/60 text-left text-xs space-y-1 mb-6">
        <div><span className="text-muted">Status:</span> <span className="font-bold uppercase text-success">{resultData?.status || 'Present'}</span></div>
        <div><span className="text-muted">Recorded At:</span> <span className="font-semibold">{new Date().toLocaleTimeString()}</span></div>
      </div>

      <Link to="/student/attendance/history" className="btn-primary w-full">
        View Attendance History
      </Link>
    </div>
  );
};
