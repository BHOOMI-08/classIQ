import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { submissionService } from '../../../services/submissionService.js';
import { gradingService } from '../../../services/gradingService.js';
import { rubricService } from '../../../services/rubricService.js';
import { assignmentService } from '../../../services/assignmentService.js';

import { ArrowLeft, CheckCircle, Save, Send, FileText, Layers, AlertCircle } from 'lucide-react';

export const GradingWorkspacePage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(true);

  // Grading form state
  const [rawMarks, setRawMarks] = useState(0);
  const [adjustmentMarks, setAdjustmentMarks] = useState(0);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [criteriaScores, setCriteriaScores] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadSubmissionData = useCallback(async () => {
    setLoading(true);
    try {
      const subRes = await submissionService.getSubmissionDetails(submissionId);
      const sub = subRes?.data?.submission;
      setSubmission(sub);

      if (sub?.assignmentId) {
        const [assRes, rubRes] = await Promise.all([
          assignmentService.getAssignmentDetails(sub.assignmentId),
          rubricService.getRubric(sub.assignmentId),
        ]);
        setAssignment(assRes?.data?.assignment);
        setRubric(rubRes?.data?.rubric);

        if (sub.finalGradeId) {
          setRawMarks(sub.finalGradeId.rawMarks || 0);
          setAdjustmentMarks(sub.finalGradeId.adjustmentMarks || 0);
          setOverallFeedback(sub.finalGradeId.overallFeedback || '');
        }
      }
    } catch (err) {
      console.error('Error loading submission details for grading:', err);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    loadSubmissionData();
  }, [loadSubmissionData]);

  const handleCriterionChange = (critId, awardedMarks) => {
    const updated = { ...criteriaScores, [critId]: Number(awardedMarks) };
    setCriteriaScores(updated);

    const totalRubricMarks = Object.values(updated).reduce((acc, val) => acc + (val || 0), 0);
    setRawMarks(totalRubricMarks);
  };

  const handleSaveGrade = async (isPublished = false) => {
    setSubmitting(true);
    setError(null);
    try {
      const rubricCriteriaMarks = Object.keys(criteriaScores).map((critId) => ({
        criterionId: critId,
        awardedMarks: criteriaScores[critId],
      }));

      await gradingService.gradeSubmission(submissionId, {
        rawMarks,
        rubricCriteriaMarks,
        adjustmentMarks,
        overallFeedback,
        internalNote,
        isPublished,
      });

      if (isPublished) {
        navigate(`/teacher/assignments/${submission.assignmentId}/submissions`);
      } else {
        await loadSubmissionData();
        alert('Grade saved as draft!');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !submission || !assignment) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentVersion = submission.currentVersionId;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <Link to={`/teacher/assignments/${submission.assignmentId}/submissions`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Submissions Roster</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Submission Content & Files */}
        <div className="card p-6 space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-xl font-bold">{submission.studentId?.name || 'Student Submission'}</h2>
            <p className="text-xs text-secondary">
              Assignment: <strong>{assignment.title}</strong> • Attempt #{submission.attemptNumber}
            </p>

            {submission.isLate && (
              <div className="alert-warning text-xs mt-2">
                ⚠️ Submitted <strong>{submission.lateByMinutes} minutes late</strong>. Late penalty will be calculated automatically by server policy.
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Submission Text</span>
            </h3>
            {currentVersion?.submissionText ? (
              <div className="bg-surface p-4 rounded-lg text-xs font-mono whitespace-pre-wrap border border-border">
                {currentVersion.submissionText}
              </div>
            ) : (
              <p className="text-xs text-secondary italic">No text provided.</p>
            )}
          </div>
        </div>

        {/* Right Column: Grading Panel */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold">Grade & Evaluate</h2>

          {error && <div className="alert-error text-xs">{error}</div>}

          {/* Rubric Criteria Section */}
          {rubric?.criteria?.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Rubric Criteria Scoring</span>
              </h3>

              {rubric.criteria.map((crit) => (
                <div key={crit._id} className="p-3 border rounded-lg bg-surface">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs">{crit.title} (Max {crit.maximumMarks})</span>
                    <input
                      type="number"
                      min="0"
                      max={crit.maximumMarks}
                      value={criteriaScores[crit._id] ?? 0}
                      onChange={(e) => handleCriterionChange(crit._id, e.target.value)}
                      className="input-field w-20 text-xs py-1"
                    />
                  </div>
                  <p className="text-xs text-secondary">{crit.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Marks Summary */}
          <div className="space-y-3 pt-3 border-t">
            <div>
              <label className="input-label">Raw Marks (out of {assignment.totalMarks})</label>
              <input
                type="number"
                min="0"
                max={assignment.totalMarks}
                value={rawMarks}
                onChange={(e) => setRawMarks(Number(e.target.value))}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Overall Written Feedback for Student</label>
              <textarea
                placeholder="Constructive feedback, strengths, and areas for improvement..."
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                className="input-field min-h-[90px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleSaveGrade(false)}
              disabled={submitting}
              className="btn-secondary flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft Grade</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveGrade(true)}
              disabled={submitting}
              className="btn-primary flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
              <span>Publish & Return Grade</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
