import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService.js';
import { submissionService } from '../../../services/submissionService.js';

import { ArrowLeft, Upload, Save, CheckCircle, FileText, AlertCircle } from 'lucide-react';

export const SubmissionDraftPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        assignmentService.getAssignmentDetails(assignmentId),
        submissionService.getStudentSubmission(assignmentId),
      ]);
      setAssignment(assRes?.data?.assignment);

      const sub = subRes?.data?.submission;
      if (sub) {
        setSubmission(sub);
        setSubmissionText(sub.submissionText || '');
        setSubmissionNote(sub.submissionNote || '');
      }
    } catch (err) {
      console.error('Error loading submission workspace:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveDraft = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('submissionText', submissionText);
      formData.append('submissionNote', submissionNote);
      for (const f of files) {
        formData.append('files', f);
      }

      await submissionService.saveDraft(assignmentId, formData);
      await loadData();
      alert('Draft saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('submissionText', submissionText);
      formData.append('submissionNote', submissionNote);
      for (const f of files) {
        formData.append('files', f);
      }

      const res = await submissionService.submitFinal(assignmentId, formData);
      setReceipt(res?.data?.receiptCode || res?.data?.submission?.receiptCode || 'RC-SUCCESS');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !assignment) {
    return (
      <div className="flex justify-center p-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Link to={`/student/assignments/${assignmentId}`} className="btn-secondary btn-sm flex items-center gap-1 w-fit mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignment Details</span>
      </Link>

      <div className="card p-6">
        <h1 className="text-xl font-bold mb-1">Submit Assignment: {assignment.title}</h1>
        <p className="text-sm text-secondary mb-6">
          Enter text solutions and upload attachment files before the deadline.
        </p>

        {error && <div className="alert-error mb-4">{error}</div>}

        {receipt ? (
          <div className="card p-6 bg-success/10 border-success text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <h2 className="text-xl font-bold text-success">Submission Received!</h2>
            <p className="text-sm text-secondary">
              Your assignment attempt has been recorded cleanly on the server.
            </p>
            <div className="p-3 bg-surface rounded-lg font-mono text-sm inline-block border border-border">
              Receipt Code: <strong>{receipt}</strong>
            </div>
            <div>
              <Link to={`/student/assignments/${assignmentId}`} className="btn-primary mt-4 inline-block">
                View Submission Details
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitFinal} className="space-y-6">
            <div>
              <label className="input-label">Submission Text / Solution Code</label>
              <textarea
                placeholder="Type or paste your solution text here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="input-field min-h-[160px] font-mono text-sm"
              />
            </div>

            <div>
              <label className="input-label">Upload Submission Files (PDF, DOCX, TXT, ZIP up to 25MB)</label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Student Note (Optional)</label>
              <input
                type="text"
                placeholder="Any special notes for the evaluator..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={submitting}
                className="btn-secondary flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-1"
              >
                {submitting ? (
                  <>
                    <div className="spinner-sm"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Finalize & Submit Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
