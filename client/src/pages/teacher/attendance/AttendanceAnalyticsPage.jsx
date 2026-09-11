import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAttendanceAnalytics } from '../../../hooks/useAttendanceAnalytics.js';
import { useAnalyticsFilters } from '../../../hooks/useAnalyticsFilters.js';
import { AnalyticsFilterBar } from '../../../components/attendance/analytics/AnalyticsFilterBar.jsx';
import { AnalyticsSummaryCard } from '../../../components/attendance/analytics/AnalyticsSummaryCard.jsx';
import { AttendanceTrendChart } from '../../../components/attendance/analytics/AttendanceTrendChart.jsx';
import { AttendanceDistributionChart } from '../../../components/attendance/analytics/AttendanceDistributionChart.jsx';
import { StudentRiskTable } from '../../../components/attendance/analytics/StudentRiskTable.jsx';
import { ExportReportModal } from '../../../components/attendance/analytics/ExportReportModal.jsx';
import { BarChart2, Users, Clock, ShieldAlert, Download, ArrowLeft } from 'lucide-react';

export const AttendanceAnalyticsPage = () => {
  const { classId } = useParams();
  const { filters, updateFilter, resetFilters } = useAnalyticsFilters();
  const { overview, trends, loading, error, refreshAnalytics } = useAttendanceAnalytics(classId, filters);

  const [activeTab, setActiveTab] = useState('overview'); // overview, students, trends, security
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Link to={`/teacher/classes/${classId}/attendance`} className="btn-secondary btn-sm flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Attendance Hub</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center space-x-2">
            <BarChart2 className="w-7 h-7 text-primary" />
            <span>Attendance Analytics & Insights</span>
          </h1>
          <p className="text-muted text-sm">
            {overview?.classroomName || 'Classroom'} — Real MongoDB aggregate attendance data
          </p>
        </div>

        <button onClick={() => setIsExportModalOpen(true)} className="btn-primary flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Official Report</span>
        </button>
      </div>

      {/* Analytics Filters */}
      <AnalyticsFilterBar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Student Risk Roster
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'trends' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Trends & Distribution
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center">Loading analytics dashboard...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : activeTab === 'overview' ? (
        <div>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <AnalyticsSummaryCard
              title="Average Attendance"
              value={overview?.averageAttendancePct !== null ? `${overview?.averageAttendancePct}%` : 'N/A'}
              subtext={`Target: ${overview?.attendanceThreshold || 75}%`}
              color={overview?.averageAttendancePct >= 75 ? 'success' : 'danger'}
            />
            <AnalyticsSummaryCard
              title="Conducted Sessions"
              value={overview?.totalSessionsConducted || 0}
              subtext={`${overview?.totalEnrolledStudents || 0} enrolled students`}
              color="primary"
            />
            <AnalyticsSummaryCard
              title="Late Arrival Rate"
              value={`${overview?.lateArrivalRate || 0}%`}
              subtext="Of recorded attendance"
              color="warning"
            />
            <AnalyticsSummaryCard
              title="Students Below Target"
              value={overview?.studentDistribution?.atRisk || 0}
              subtext="Require recovery plan"
              color="danger"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AttendanceTrendChart trends={trends} />
            </div>
            <div className="lg:col-span-1">
              <AttendanceDistributionChart statusCounts={overview?.statusCounts} />
            </div>
          </div>
        </div>
      ) : activeTab === 'students' ? (
        <StudentRiskTable classroomId={classId} students={[]} />
      ) : (
        <AttendanceTrendChart trends={trends} />
      )}

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        classroomId={classId}
      />
    </div>
  );
};
