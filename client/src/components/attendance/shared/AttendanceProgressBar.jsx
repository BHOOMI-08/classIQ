import React from 'react';

export const AttendanceProgressBar = ({ percentage = 0, threshold = 75 }) => {
  const getBarColor = () => {
    if (percentage >= threshold) return 'bg-success';
    if (percentage >= threshold - 5) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1 font-medium">
        <span>Attendance Rate</span>
        <span className={percentage >= threshold ? 'text-success' : 'text-danger'}>
          {percentage}% (Target: {threshold}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        ></div>
      </div>
    </div>
  );
};
