import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const AttendanceSubmissionProgress = ({ step = 1 }) => {
  const steps = ['Scanned QR', 'Verifying Token', 'Checking Enrollment', 'Geofence Check', 'Finalizing'];

  return (
    <div className="card p-8 text-center max-w-sm mx-auto my-6 flex flex-col items-center">
      <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
      <h3 className="text-xl font-bold mb-2">Verifying Attendance</h3>
      <p className="text-xs text-muted mb-6">Communicating with ClassIQ Security Engine...</p>

      <div className="w-full space-y-2 text-left text-xs">
        {steps.map((label, idx) => (
          <div key={idx} className={`flex items-center space-x-2 ${idx + 1 <= step ? 'text-success font-semibold' : 'text-muted'}`}>
            <ShieldCheck className="w-4 h-4" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
