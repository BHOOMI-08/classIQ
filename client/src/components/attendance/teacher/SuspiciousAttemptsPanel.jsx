import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { RiskLevelBadge } from '../shared/RiskLevelBadge.jsx';

export const SuspiciousAttemptsPanel = ({ attempts = [] }) => {
  return (
    <div className="card p-6 my-6 border-l-4 border-l-warning">
      <div className="flex items-center space-x-2 mb-2">
        <ShieldAlert className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-bold">Suspicious Activity Signals ({attempts.length})</h3>
      </div>
      <p className="text-xs text-muted mb-4">
        Risk signals are automated indicators for teacher review and are not definitive proof of proxy attendance.
      </p>

      {attempts.length === 0 ? (
        <p className="text-sm text-muted">No high-risk attempts flagged for this session.</p>
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => (
            <div key={att._id} className="p-3 rounded-lg bg-surface-variant/50 border border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">{att.studentId?.name || 'Student'}</span>
                <RiskLevelBadge level={att.suspicionLevel} />
              </div>
              <div className="text-xs space-y-1">
                {att.suspicionSignals?.map((sig, idx) => (
                  <div key={idx} className="text-warning flex items-center space-x-1">
                    <span>•</span>
                    <span>{sig.code.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
