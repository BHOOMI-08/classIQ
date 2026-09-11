import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentAnalyticsService } from '../../../services/assignmentAnalyticsService.js';
import { ArrowLeft, BarChart2, Download, CheckCircle, Users, AlertTriangle } from 'lucide-react';

export const AssignmentAnalyticsPage = () => {
  const { assignmentId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const res = await assignmentAnalyticsService.getAnalytics(assignmentId);
        setAnalytics(res?.data?.analytics);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [assignmentId]);

  if (loading || !analytics) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  const exportUrl = assignmentAnalyticsService.getExportCSVUrl(assignmentId);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <Link to={`/teacher/assignments/${assignmentId}`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignment Details</span>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            <span>Assignment Analytics: {analytics.assignment?.title}</span>
          </h1>
          <p className="text-sm text-secondary">
            Score distribution, pass rates, submission lead times, and CSV report export.
          </p>
        </div>

        <a href={exportUrl} download className="btn-primary btn-sm flex items-center gap-1">
          <Download className="w-4 h-4" />
          <span>Export Results CSV</span>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Submission Rate</span>
          <p className="text-2xl font-bold text-primary">{analytics.submissionRate}%</p>
          <p className="text-xs text-secondary">{analytics.submittedCount} of {analytics.totalEnrolled} enrolled</p>
        </div>

        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Pass Rate</span>
          <p className="text-2xl font-bold text-success">{analytics.passRate}%</p>
          <p className="text-xs text-secondary">{analytics.passCount} students passed</p>
        </div>

        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Average Score</span>
          <p className="text-2xl font-bold">{analytics.averageMarks} / {analytics.assignment?.totalMarks}</p>
          <p className="text-xs text-secondary">High: {analytics.highestMarks} | Low: {analytics.lowestMarks}</p>
        </div>

        <div className="card p-4">
          <span className="text-xs text-secondary font-medium">Missing Submissions</span>
          <p className="text-2xl font-bold text-danger">{analytics.missingCount}</p>
          <p className="text-xs text-secondary">Overdue non-submitters</p>
        </div>
      </div>
    </div>
  );
};
