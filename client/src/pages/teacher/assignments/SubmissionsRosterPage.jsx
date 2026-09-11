import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submissionService } from '../../../services/submissionService.js';
import { assignmentService } from '../../../services/assignmentService.js';

import { ArrowLeft, Users, CheckCircle, Clock, AlertTriangle, Eye, Edit3 } from 'lucide-react';

export const SubmissionsRosterPage = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('all');

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        assignmentService.getAssignmentDetails(assignmentId),
        submissionService.getSubmissionsRoster(assignmentId),
      ]);
      setAssignment(assRes?.data?.assignment);
      setSubmissions(subRes?.data?.items || []);
    } catch (err) {
      console.error('Error loading submissions roster:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const filteredSubmissions = submissions.filter((s) => {
    if (filterState === 'submitted') return s.status === 'submitted';
    if (filterState === 'late') return s.isLate;
    if (filterState === 'graded') return s.status === 'graded' || s.status === 'returned';
    if (filterState === 'missing') return s.status === 'missing';
    return true;
  });

  if (loading || !assignment) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <Link to={`/teacher/assignments/${assignment._id}`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignment Details</span>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>Submissions Roster: {assignment.title}</span>
          </h1>
          <p className="text-sm text-secondary">
            Review student attempts, evaluate rubrics, enter marks, and return feedback.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterState('all')} className={`btn-sm ${filterState === 'all' ? 'btn-primary' : 'btn-secondary'}`}>
          All ({submissions.length})
        </button>
        <button onClick={() => setFilterState('submitted')} className={`btn-sm ${filterState === 'submitted' ? 'btn-primary' : 'btn-secondary'}`}>
          Submitted ({submissions.filter((s) => s.status === 'submitted').length})
        </button>
        <button onClick={() => setFilterState('late')} className={`btn-sm ${filterState === 'late' ? 'btn-primary' : 'btn-secondary'}`}>
          Late ({submissions.filter((s) => s.isLate).length})
        </button>
        <button onClick={() => setFilterState('graded')} className={`btn-sm ${filterState === 'graded' ? 'btn-primary' : 'btn-secondary'}`}>
          Graded ({submissions.filter((s) => s.status === 'graded' || s.status === 'returned').length})
        </button>
        <button onClick={() => setFilterState('missing')} className={`btn-sm ${filterState === 'missing' ? 'btn-primary' : 'btn-secondary'}`}>
          Missing ({submissions.filter((s) => s.status === 'missing').length})
        </button>
      </div>

      {/* Submissions Roster List */}
      {filteredSubmissions.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-1">No Submissions Found</h3>
          <p className="text-sm text-secondary">Student submissions will appear here once submitted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => (
            <div key={sub._id} className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base">{sub.studentId?.name || 'Student'}</h3>
                  <span className="text-xs text-secondary">({sub.studentId?.email})</span>
                  <span className={`badge text-xs font-bold ${sub.status === 'returned' ? 'badge-success' : sub.status === 'missing' ? 'badge-danger' : 'badge-info'}`}>
                    {sub.status}
                  </span>
                  {sub.isLate && <span className="badge badge-warning text-xs font-bold">LATE ({sub.lateByMinutes}m)</span>}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-secondary">
                  <span>Attempt: <strong>#{sub.attemptNumber}</strong></span>
                  <span>Submitted: <strong>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}</strong></span>
                  {sub.receiptCode && <span>Receipt: <strong className="font-mono">{sub.receiptCode}</strong></span>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {sub.finalGradeId && (
                  <span className="text-sm font-bold text-primary mr-2">
                    {sub.finalGradeId.finalMarks} / {assignment.totalMarks} ({sub.finalGradeId.gradeLabel})
                  </span>
                )}

                {sub.status !== 'missing' && (
                  <Link to={`/teacher/submissions/${sub._id}/grade`} className="btn-primary btn-sm flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{sub.finalGradeId ? 'Edit Grade' : 'Grade'}</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
