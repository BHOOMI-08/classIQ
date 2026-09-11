import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { RiskLevelBadge } from '../shared/RiskLevelBadge.jsx';

export const RejectedAttemptsPanel = ({ attempts = [] }) => {
  return (
    <div className="card p-6 my-6 border-l-4 border-l-danger">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-danger" />
        <h3 className="text-lg font-bold">Rejected Attempts ({attempts.length})</h3>
      </div>

      {attempts.length === 0 ? (
        <p className="text-sm text-muted">No rejected submission attempts for this session.</p>
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => (
            <div key={att._id} className="p-3 rounded-lg bg-surface-variant/50 border border-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{att.studentId?.name || 'Student'}</div>
                <div className="text-xs text-danger font-medium">{att.rejectionReason || att.result}</div>
              </div>
              <div className="flex items-center space-x-2">
                <RiskLevelBadge level={att.suspicionLevel || 'medium'} />
                <span className="text-xs text-muted">{new Date(att.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
