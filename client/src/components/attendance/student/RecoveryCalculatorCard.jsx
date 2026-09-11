import React from 'react';
import { RefreshCcw } from 'lucide-react';

export const RecoveryCalculatorCard = ({ recoveryClasses = 0, threshold = 75 }) => {
  return (
    <div className="card p-5 border-l-4 border-l-warning flex items-center space-x-4">
      <div className="p-3 rounded-full bg-warning/10 text-warning">
        <RefreshCcw className="w-8 h-8" />
      </div>
      <div>
        <div className="text-2xl font-black text-warning">
          {recoveryClasses} Consecutive {recoveryClasses === 1 ? 'Class' : 'Classes'} Needed
        </div>
        <p className="text-xs text-muted">
          You must attend the next {recoveryClasses} consecutive classes without absence to recover your attendance above {threshold}%.
        </p>
      </div>
    </div>
  );
};
