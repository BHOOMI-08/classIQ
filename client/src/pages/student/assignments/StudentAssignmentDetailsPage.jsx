import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService.js';
import { submissionService } from '../../../services/submissionService.js';
import { rubricService } from '../../../services/rubricService.js';

import { ArrowLeft, ClipboardList, Calendar, Clock, CheckCircle, Upload, Layers, Award } from 'lucide-react';

export const StudentAssignmentDetailsPage = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [assRes, subRes, rubRes] = await Promise.all([
        assignmentService.getAssignmentDetails(assignmentId),
        submissionService.getStudentSubmission(assignmentId),
        rubricService.getRubric(assignmentId),
      ]);
      setAssignment(assRes?.data?.assignment);
      setSubmission(subRes?.data?.submission);
      setRubric(rubRes?.data?.rubric);
    } catch (err) {
      console.error('Error loading assignment details:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (loading || !assignment) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  const isGraded = submission?.status === 'graded' || submission?.status === 'returned';

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <Link to={`/student/classes/${assignment.classroomId}/assignments`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignments</span>
      </Link>

      {/* Header Banner */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="badge badge-secondary text-xs uppercase mb-2 inline-block">{assignment.assignmentType}</span>
            <h1 className="text-2xl font-bold mb-1">{assignment.title}</h1>
            <p className="text-sm text-secondary mb-3">{assignment.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
              <span>Topic: <strong>{assignment.topic}</strong></span>
              <span>Unit: <strong>{assignment.unit}</strong></span>
              <span>Total Marks: <strong>{assignment.totalMarks}</strong></span>
              <span>Due: <strong>{new Date(assignment.dueAt).toLocaleString()}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGraded ? (
              <Link to={`/student/submissions/${submission._id}/result`} className="btn-primary btn-sm flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>View Returned Grade</span>
              </Link>
            ) : (
              <Link to={`/student/assignments/${assignment._id}/submit`} className="btn-primary btn-sm flex items-center gap-1">
                <Upload className="w-4 h-4" />
                <span>{submission ? 'Edit Submission' : 'Submit Assignment'}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Submission Status Indicator */}
      {submission && (
        <div className="card p-4 mb-6 flex items-center justify-between border-l-4 border-l-primary">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm">Submission Status:</span>
              <span className="badge badge-success text-xs font-bold uppercase">{submission.status}</span>
              {submission.isLate && <span className="badge badge-warning text-xs font-bold">LATE</span>}
            </div>
            {submission.receiptCode && (
              <p className="text-xs text-secondary">Receipt Code: <strong className="font-mono">{submission.receiptCode}</strong></p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6 mb-6 space-y-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <span>Instructions & Task Prompts</span>
        </h3>
        <div className="bg-surface p-4 rounded-lg text-sm font-mono whitespace-pre-wrap border border-border">
          {assignment.instructions}
        </div>
      </div>

      {/* Rubric Breakdown */}
      {rubric && (
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span>Evaluation Rubric</span>
          </h3>
          <div className="space-y-3">
            {rubric.criteria?.map((c) => (
              <div key={c._id} className="p-3 border rounded-lg bg-surface flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm">{c.title}</h4>
                  <p className="text-xs text-secondary">{c.description}</p>
                </div>
                <span className="badge badge-info text-xs font-bold">{c.maximumMarks} Marks</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
