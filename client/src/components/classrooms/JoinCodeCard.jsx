import React, { useState } from 'react';
import { Copy, Check, RotateCw, Key, ShieldAlert } from 'lucide-react';

export const JoinCodeCard = ({ joinCode, onRegenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="join-code-card">
      <div className="join-code-card-header">
        <div className="icon-box">
          <Key size={20} />
        </div>
        <div>
          <h4>Classroom Join Code</h4>
          <p>Share this 6-character code with students to allow enrollment</p>
        </div>
      </div>

      <div className="join-code-display-box">
        <span className="code-text">{joinCode}</span>
        <button onClick={handleCopy} className="btn-copy-code">
          {copied ? <Check size={16} color="var(--status-success)" /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      <div className="join-code-card-footer">
        <p className="hint-text">
          Codes are uppercase and unique. Regenerating invalidates previous codes immediately.
        </p>
        {onRegenerate && (
          <button onClick={onRegenerate} className="btn-regenerate-link">
            <RotateCw size={13} /> Regenerate Code
          </button>
        )}
      </div>
    </div>
  );
};

export default JoinCodeCard;
