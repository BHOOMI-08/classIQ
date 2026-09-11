import React from 'react';

export default function PollDistributionChart({ optionDistribution = [], totalResponses = 0, accuracyPercentage }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Live Poll Response Distribution</h3>
          <p className="text-xs text-slate-400">Total votes: {totalResponses}</p>
        </div>
        {accuracyPercentage !== undefined && (
          <div className="text-right">
            <span className="text-2xl font-extrabold text-emerald-400">{accuracyPercentage}%</span>
            <span className="block text-xs uppercase text-slate-400 font-medium">Class Accuracy</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {optionDistribution.map((opt, idx) => (
          <div key={opt.optionId || idx} className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center space-x-2">
                <span>{opt.text}</span>
                {opt.isCorrect && <span className="text-xs text-emerald-400 font-bold">✓ (Correct)</span>}
              </span>
              <span>{opt.count} votes ({opt.percentage}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${opt.isCorrect ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${opt.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
