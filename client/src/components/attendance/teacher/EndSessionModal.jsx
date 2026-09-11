import React, { useState } from 'react';
import { AlertOctagon } from 'lucide-react';

export const EndSessionModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('Class completed');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md p-6 bg-surface border border-border">
        <div className="flex items-center space-x-2 text-danger mb-4">
          <AlertOctagon className="w-6 h-6" />
          <h3 className="text-xl font-bold">End Attendance Session?</h3>
        </div>

        <p className="text-sm text-muted mb-4">
          Ending this session will invalidate the live QR token immediately. Active enrolled students without a recorded attendance will be automatically marked <strong>Absent</strong>.
        </p>

        <div className="mb-4">
          <label className="label font-medium">Session End Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input-field w-full text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <button onClick={onClose} className="btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-danger" disabled={submitting}>
            {submitting ? 'Ending Session...' : 'Confirm End Session'}
          </button>
        </div>
      </div>
    </div>
  );
};
