import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAttendanceHealth } from '../../../hooks/useAttendanceHealth.js';
import { AttendanceHealthCard } from '../../../components/attendance/student/AttendanceHealthCard.jsx';
import { SafeLeaveCard } from '../../../components/attendance/student/SafeLeaveCard.jsx';
import { RecoveryCalculatorCard } from '../../../components/attendance/student/RecoveryCalculatorCard.jsx';
import { AttendanceForecastCard } from '../../../components/attendance/student/AttendanceForecastCard.jsx';
import { ArrowLeft, Calculator } from 'lucide-react';

export const SubjectAttendanceDetailsPage = () => {
  const { classId } = useParams();
  const { healthData, forecast, loading, error } = useAttendanceHealth(classId);

  const [futureAttended, setFutureAttended] = useState(3);
  const [futureMissed, setFutureMissed] = useState(0);
  const [customScenarioResult, setCustomScenarioResult] = useState(null);

  if (loading) return <div className="container mx-auto p-6 text-center">Loading subject analytics...</div>;
  if (error || !healthData) return <div className="container mx-auto p-6 text-center text-muted">Subject analytics unavailable.</div>;

  const handleCalculateScenario = (e) => {
    e.preventDefault();
    const newT = healthData.totalConducted + Number(futureAttended) + Number(futureMissed);
    const newA = healthData.attendedEquivalent + Number(futureAttended);
    const pct = newT > 0 ? Math.round((newA / newT) * 10000) / 100 : 100;
    setCustomScenarioResult(pct);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="flex items-center space-x-2 mb-6">
        <Link to="/student/attendance/health" className="btn-secondary btn-sm flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>All Subjects Health</span>
        </Link>
      </div>

      <div className="space-y-6">
        <AttendanceHealthCard health={healthData} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SafeLeaveCard safeLeaves={healthData.safeLeaves} threshold={healthData.attendanceThreshold} />
          <RecoveryCalculatorCard recoveryClasses={healthData.recoveryClasses} threshold={healthData.attendanceThreshold} />
        </div>

        <AttendanceForecastCard forecast={forecast} />

        {/* Custom What-If Scenario Form */}
        <div className="card p-6 border border-primary/40 bg-surface-variant/30">
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Custom "What-If" Scenario Calculator</h3>
          </div>

          <form onSubmit={handleCalculateScenario} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="label text-xs font-semibold">Future Classes Attended</label>
              <input
                type="number"
                min="0"
                max="50"
                value={futureAttended}
                onChange={(e) => setFutureAttended(e.target.value)}
                className="input-field w-full text-sm"
              />
            </div>

            <div>
              <label className="label text-xs font-semibold">Future Classes Missed</label>
              <input
                type="number"
                min="0"
                max="50"
                value={futureMissed}
                onChange={(e) => setFutureMissed(e.target.value)}
                className="input-field w-full text-sm"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Calculate Projection
            </button>
          </form>

          {customScenarioResult !== null && (
            <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
              <span className="text-sm font-semibold">Projected Attendance Rate:</span>
              <span className="text-2xl font-black text-primary">{customScenarioResult}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
