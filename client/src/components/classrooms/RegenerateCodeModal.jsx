import React from 'react';
import { RotateCw, AlertTriangle, X } from 'lucide-react';

export const RegenerateCodeModal = ({ classroom, onConfirm, onClose, loading }) => {
  if (!classroom) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title-group">
            <RotateCw size={22} className="modal-icon primary" />
            <h3>Regenerate Join Code</h3>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>
            Regenerate join code for <b>{classroom.name}</b>?
          </p>
          <div className="alert-box warning">
            <AlertTriangle size={16} />
            <span>
              The previous join code <b>{classroom.joinCode}</b> will stop working immediately. Existing enrolled students will remain unaffected.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary" disabled={loading}>
            {loading ? 'Regenerating...' : 'Regenerate Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegenerateCodeModal;
