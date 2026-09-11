import React, { useState } from 'react';

const CLASSIFICATION_COLORS = {
  low: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-400' },
  moderate: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300', badge: 'bg-amber-500/20 text-amber-400' },
  high: { bg: 'bg-orange-500/10 border-orange-500/30 text-orange-300', badge: 'bg-orange-500/20 text-orange-400' },
  critical: { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300', badge: 'bg-rose-500/20 text-rose-400' },
};

export default function ConfusionHeatmap({ heatmap = [] }) {
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>🔥</span>
            <span>Classroom Confusion Heatmap</span>
          </h2>
          <p className="text-xs text-slate-400">Multi-module intelligence combining quizzes, exit tickets, pulses & doubts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {heatmap.map((item) => {
          const style = CLASSIFICATION_COLORS[item.classification] || CLASSIFICATION_COLORS.low;
          return (
            <button
              key={item.topic}
              onClick={() => setSelectedTopic(item)}
              className={`p-5 rounded-2xl border transition-all duration-200 text-left space-y-3 hover:scale-[1.02] ${style.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${style.badge}`}>
                  {item.classification}
                </span>
                <span className="text-2xl font-extrabold">{item.confusionScore}%</span>
              </div>
              <h4 className="text-base font-bold text-slate-100">{item.topic}</h4>
              <p className="text-xs opacity-75">Click to view signal evidence</p>
            </button>
          );
        })}
      </div>

      {/* Evidence Drawer Modal */}
      {selectedTopic && (
        <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="font-bold text-slate-100 text-base">Evidence Breakdown: {selectedTopic.topic}</h4>
            <button onClick={() => setSelectedTopic(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 block">Quiz Error (30%)</span>
              <strong className="text-rose-400 font-bold text-base">{selectedTopic.evidence?.quizErrorRate}%</strong>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 block">Exit Ticket Error (25%)</span>
              <strong className="text-orange-400 font-bold text-base">{selectedTopic.evidence?.exitTicketErrorRate}%</strong>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 block">Pulse Confusion (20%)</span>
              <strong className="text-amber-400 font-bold text-base">{selectedTopic.evidence?.pulseConfusionRate}%</strong>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 block">Doubt Intensity (15%)</span>
              <strong className="text-indigo-400 font-bold text-base">{selectedTopic.evidence?.doubtIntensity}%</strong>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 block">Revision Freq (10%)</span>
              <strong className="text-emerald-400 font-bold text-base">{selectedTopic.evidence?.revisionFrequency}%</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
