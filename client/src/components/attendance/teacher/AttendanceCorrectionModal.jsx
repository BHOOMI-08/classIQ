import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';

export const AttendanceCorrectionModal = ({ isOpen, onClose, record, onSave }) => {
  const [newStatus, setNewStatus] = useState('present');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (record) {
      setNewStatus(record.status || 'present');
      setReason('');
      setEvidence('');
      setError(null);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 5) {
      setError('Reason must be at least 5 characters long');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSave(record._id, { newStatus, reason: reason.trim(), evidence: evidence.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update attendance status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-6 bg-surface border border-border">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Correct Attendance Status</h3>
          </div>
          <button onClick={onClose} className="btn-icon">×</button>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="text-sm font-semibold mb-1">Student: {record.studentId?.name || 'Student'}</div>
            <div className="text-xs text-muted">Current Status: <span className="font-bold">{record.status}</span></div>
          </div>

          <div>
            <label className="label font-medium">New Attendance Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-select w-full"
            >
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="label font-medium">Correction Reason (Required)</label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Student presented valid medical certificate"
              className="input-textarea w-full text-sm"
              required
            ></textarea>
          </div>

          <div>
            <label className="label font-medium">Evidence / Document Link (Optional)</label>
            <input
              type="text"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="e.g. Medical Cert #10492"
              className="input-field w-full text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
