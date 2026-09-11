import React from 'react';
import { Clock } from 'lucide-react';

export const QrCountdown = ({ seconds = 15 }) => {
  const safeSec = Math.max(0, seconds);

  return (
    <div className="flex items-center space-x-1.5 text-xs font-semibold text-muted">
      <Clock className="w-4 h-4 text-primary animate-pulse" />
      <span>Rotates in:</span>
      <span className={`px-2 py-0.5 rounded font-mono text-sm ${safeSec <= 3 ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'}`}>
        {safeSec}s
      </span>
    </div>
  );
};
