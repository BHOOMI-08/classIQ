import React from 'react';

const OPTION_CONFIG = {
  confused: { label: 'Confused', color: 'bg-rose-500', bgLight: 'bg-rose-50 border-rose-200 text-rose-800' },
  partially_clear: { label: 'Partially Clear', color: 'bg-amber-500', bgLight: 'bg-amber-50 border-amber-200 text-amber-800' },
  clear: { label: 'Clear', color: 'bg-emerald-500', bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  can_explain: { label: 'Can Explain to Others', color: 'bg-indigo-500', bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
};

export default function PulseDistributionChart({ counts = {}, percentages = {}, confidenceIndex, confidenceLabel, totalResponses = 0 }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Live Pulse Distribution</h3>
          <p className="text-xs text-slate-400">Perceived student confidence index</p>
        </div>

        {confidenceIndex !== null ? (
          <div className="text-right">
            <span className="text-3xl font-extrabold text-indigo-400">{confidenceIndex}%</span>
            <span className="block text-xs uppercase font-medium tracking-wider text-slate-400">{confidenceLabel}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-500 italic">No responses yet</span>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(OPTION_CONFIG).map(([key, config]) => {
          const count = counts[key] || 0;
          const pct = percentages[key] || 0;
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>{config.label}</span>
                <span>{count} ({pct}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-800">
        Total Responses: <strong className="text-slate-200">{totalResponses}</strong>
      </div>
    </div>
  );
}
