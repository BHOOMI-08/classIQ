import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submissionService } from '../../../services/submissionService.js';
import { ArrowLeft, Award, CheckCircle, Clock } from 'lucide-react';

export const StudentGradeViewPage = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubmission = async () => {
      setLoading(true);
      try {
        const res = await submissionService.getSubmissionDetails(submissionId);
        setSubmission(res?.data?.submission);
      } catch (err) {
        console.error('Error loading grade details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSubmission();
  }, [submissionId]);

  if (loading || !submission) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  const grade = submission.finalGradeId || {};

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Link to={`/student/assignments/${submission.assignmentId}`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignment Details</span>
      </Link>

      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              <span>Returned Grade & Feedback</span>
            </h1>
            <p className="text-sm text-secondary">Evaluated by instructor on {new Date(grade.returnedAt || grade.updatedAt).toLocaleDateString()}</p>
          </div>

          <div className="text-right">
            <span className="text-3xl font-extrabold text-primary">{grade.finalMarks}</span>
            <span className="text-lg text-secondary"> / {grade.percentage}%</span>
            <span className="badge badge-success text-xs font-bold ml-2">{grade.gradeLabel}</span>
          </div>
        </div>

        {/* Score Breakdown Table */}
        <div className="bg-surface p-4 rounded-lg space-y-2 text-xs">
          <div className="flex justify-between border-b pb-1">
            <span className="text-secondary">Raw Score</span>
            <span className="font-bold">{grade.rawMarks} Marks</span>
          </div>
          {grade.latePenaltyMarks > 0 && (
            <div className="flex justify-between text-warning border-b pb-1">
              <span>Late Penalty Deduction</span>
              <span className="font-bold">-{grade.latePenaltyMarks} Marks</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 text-sm">
            <span>Final Awarded Score</span>
            <span className="text-primary">{grade.finalMarks} Marks</span>
          </div>
        </div>

        {/* Overall Written Feedback */}
        {grade.overallFeedback && (
          <div>
            <h3 className="font-bold text-base mb-2">Teacher Feedback</h3>
            <div className="bg-surface p-4 rounded-lg text-sm leading-relaxed border border-border">
              {grade.overallFeedback}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
