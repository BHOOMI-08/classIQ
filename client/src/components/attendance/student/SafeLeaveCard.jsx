import React from 'react';
import { Sun } from 'lucide-react';

export const SafeLeaveCard = ({ safeLeaves = 0, threshold = 75 }) => {
  return (
    <div className="card p-5 border-l-4 border-l-success flex items-center space-x-4">
      <div className="p-3 rounded-full bg-success/10 text-success">
        <Sun className="w-8 h-8" />
      </div>
      <div>
        <div className="text-2xl font-black text-success">{safeLeaves} {safeLeaves === 1 ? 'Safe Leave' : 'Safe Leaves'}</div>
        <p className="text-xs text-muted">
          You can safely miss up to {safeLeaves} upcoming classes while maintaining your required {threshold}% threshold.
        </p>
      </div>
    </div>
  );
};
