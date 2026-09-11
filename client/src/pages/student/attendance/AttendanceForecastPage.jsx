import React from 'react';
import { useAttendanceHealth } from '../../../hooks/useAttendanceHealth.js';
import { AttendanceForecastCard } from '../../../components/attendance/student/AttendanceForecastCard.jsx';
import { TrendingUp } from 'lucide-react';

export const AttendanceForecastPage = () => {
  const { forecast, loading } = useAttendanceHealth();

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h1 className="text-2xl font-bold flex items-center space-x-2 mb-2">
        <TrendingUp className="w-7 h-7 text-primary" />
        <span>Attendance Forecast Scenarios</span>
      </h1>
      <p className="text-muted text-sm mb-6">
        Deterministic projections based on your current attended sessions and future attendance scenarios.
      </p>

      {loading ? (
        <div className="card p-6 text-center">Calculating scenario projections...</div>
      ) : (
        <AttendanceForecastCard forecast={forecast} />
      )}
    </div>
  );
};
