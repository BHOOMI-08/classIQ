import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const AttendanceEmptyState = ({ title = 'No Attendance Sessions', message = 'No attendance records found for this selection.' }) => {
  return (
    <div className="card text-center p-8 flex flex-col items-center justify-center my-6">
      <ShieldCheck className="w-12 h-12 text-primary opacity-60 mb-3" />
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted text-sm">{message}</p>
    </div>
  );
};
