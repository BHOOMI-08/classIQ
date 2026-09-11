import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAttendanceHealth } from '../../../hooks/useAttendanceHealth.js';
import { AttendanceHealthCard } from '../../../components/attendance/student/AttendanceHealthCard.jsx';
import { SafeLeaveCard } from '../../../components/attendance/student/SafeLeaveCard.jsx';
import { RecoveryCalculatorCard } from '../../../components/attendance/student/RecoveryCalculatorCard.jsx';
import { AttendanceForecastCard } from '../../../components/attendance/student/AttendanceForecastCard.jsx';
import { Activity } from 'lucide-react';

export const AttendanceHealthPage = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');

  const { healthData, forecast, loading, error } = useAttendanceHealth(classId);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <h1 className="text-2xl font-bold flex items-center space-x-2 mb-2">
        <Activity className="w-6 h-6 text-primary" />
        <span>Attendance Health & Safe Leave Calculator</span>
      </h1>
      <p className="text-sm text-muted mb-6">
        Track overall attendance status, calculated safe leave capacity, and consecutive recovery requirements.
      </p>

      {loading ? (
        <div className="card p-6 text-center">Calculating attendance health...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : classId && healthData ? (
        <div className="space-y-6">
          <AttendanceHealthCard health={healthData} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SafeLeaveCard safeLeaves={healthData.safeLeaves} threshold={healthData.attendanceThreshold} />
            <RecoveryCalculatorCard recoveryClasses={healthData.recoveryClasses} threshold={healthData.attendanceThreshold} />
          </div>

          <AttendanceForecastCard forecast={forecast} />
        </div>
      ) : healthData?.classrooms ? (
        <div className="space-y-6">
          <div className="card p-6 border-t-4 border-t-primary">
            <h3 className="text-xl font-black mb-1">Overall Attendance</h3>
            <div className="text-3xl font-extrabold text-primary">{healthData.overallPercentage}%</div>
            <p className="text-xs text-muted mt-1">Aggregated across {healthData.totalClassesEnrolled} enrolled subjects</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Subject Health Breakdown</h3>
            {healthData.classrooms.map((cHealth) => (
              <AttendanceHealthCard key={cHealth.classroomId} health={cHealth} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center text-muted">No attendance data available.</div>
      )}
    </div>
  );
};
