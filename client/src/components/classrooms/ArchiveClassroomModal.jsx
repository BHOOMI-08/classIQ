import React from 'react';
import { Archive, AlertTriangle, X } from 'lucide-react';

export const ArchiveClassroomModal = ({ classroom, onConfirm, onClose, loading }) => {
  if (!classroom) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title-group">
            <Archive size={22} className="modal-icon warning" />
            <h3>Archive Classroom</h3>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>
            Are you sure you want to archive <b>{classroom.name}</b> ({classroom.courseCode})?
          </p>
          <div className="alert-box warning">
            <AlertTriangle size={16} />
            <span>
              Archiving prevents new students from joining. Existing enrolled students, schedules, announcements, and history will be preserved. You can restore this classroom anytime.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger" disabled={loading}>
            {loading ? 'Archiving...' : 'Archive Classroom'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveClassroomModal;
