import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

export const BlockStudentModal = ({ enrollmentItem, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');

  if (!enrollmentItem) return null;
  const student = enrollmentItem.studentId || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldAlert size={22} className="modal-icon danger" />
            <h3>Block Student</h3>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>
              Are you sure you want to block <b>{student.name || 'this student'}</b>?
            </p>
            <div className="alert-box danger">
              <AlertTriangle size={16} />
              <span>
                Blocked students cannot rejoin this classroom even if they obtain a valid join code.
              </span>
            </div>

            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label>Reason for Blocking (Optional)</label>
              <textarea
                placeholder="Specify reason for administrative record..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-control"
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Blocking...' : 'Block Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockStudentModal;
