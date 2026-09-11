import React from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

export const LeaveClassroomModal = ({ classroom, onConfirm, onClose, loading }) => {
  if (!classroom) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldAlert size={22} className="modal-icon danger" />
            <h3>Leave Classroom</h3>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>
            Are you sure you want to leave <b>{classroom.name}</b>?
          </p>
          <div className="alert-box danger">
            <AlertTriangle size={16} />
            <span>
              You will lose active access to announcements, lecture materials, and upcoming attendance sessions. You will need to rejoin with a valid code.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger" disabled={loading}>
            {loading ? 'Leaving...' : 'Leave Classroom'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveClassroomModal;
