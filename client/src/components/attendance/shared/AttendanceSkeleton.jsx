import React from 'react';

export const AttendanceSkeleton = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 my-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="card p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div>
              <div className="w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
              <div className="w-20 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
          <div className="w-16 h-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};
