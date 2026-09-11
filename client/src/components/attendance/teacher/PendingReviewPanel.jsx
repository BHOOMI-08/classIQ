import React from 'react';
import { HelpCircle, Check, X } from 'lucide-react';

export const PendingReviewPanel = ({ pendingRecords = [], onApprove, onReject }) => {
  return (
    <div className="card p-6 my-6 border-l-4 border-l-secondary">
      <div className="flex items-center space-x-2 mb-4">
        <HelpCircle className="w-5 h-5 text-secondary" />
        <h3 className="text-lg font-bold">Pending Review Submissions ({pendingRecords.length})</h3>
      </div>

      {pendingRecords.length === 0 ? (
        <p className="text-sm text-muted">No attendance submissions require teacher review.</p>
      ) : (
        <div className="space-y-3">
          {pendingRecords.map((rec) => (
            <div key={rec._id} className="p-4 rounded-lg bg-surface-variant/50 border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="font-semibold text-sm">{rec.studentId?.name || 'Student'}</div>
                <div className="text-xs text-muted">Submitted at {new Date(rec.markedAt).toLocaleTimeString()}</div>
                <div className="text-xs text-warning mt-1">Suspicion Score: {rec.suspicionScore} / 100 ({rec.suspicionLevel})</div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onApprove(rec._id)}
                  className="btn-success btn-sm flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => onReject(rec._id)}
                  className="btn-danger btn-sm flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
