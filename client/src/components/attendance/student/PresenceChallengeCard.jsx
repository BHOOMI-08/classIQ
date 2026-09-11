import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export const PresenceChallengeCard = ({ challengeData, onSubmitAnswer }) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitAnswer(answer);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6 max-w-sm mx-auto my-6 border-2 border-warning">
      <div className="flex items-center space-x-2 text-warning mb-3">
        <ShieldAlert className="w-6 h-6" />
        <h3 className="font-bold text-lg">Presence Challenge</h3>
      </div>

      <p className="text-sm text-muted mb-4">
        {challengeData?.promptData?.message || 'Please confirm your active presence to finalize attendance.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {challengeData?.promptData?.code && (
          <div className="p-3 bg-surface-variant rounded-lg text-center font-mono text-xl font-black text-primary">
            {challengeData.promptData.code}
          </div>
        )}

        <div>
          <label className="label font-medium text-xs">Enter Challenge Code / Answer</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type answer here..."
            className="input-field w-full text-center text-lg font-bold"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Verifying...' : 'Submit Challenge Response'}
        </button>
      </form>
    </div>
  );
};
