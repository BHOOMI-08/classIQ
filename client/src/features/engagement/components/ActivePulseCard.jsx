import React, { useState } from 'react';

const OPTIONS = [
  { key: 'confused', label: 'Confused', emoji: '😕', desc: 'Need help / explanation', color: 'hover:border-rose-500 hover:bg-rose-500/10 text-rose-300 border-slate-700 bg-slate-800' },
  { key: 'partially_clear', label: 'Partially Clear', emoji: '🤔', desc: 'Got basics, some doubts', color: 'hover:border-amber-500 hover:bg-amber-500/10 text-amber-300 border-slate-700 bg-slate-800' },
  { key: 'clear', label: 'Clear', emoji: '👍', desc: 'Understood topic well', color: 'hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-300 border-slate-700 bg-slate-800' },
  { key: 'can_explain', label: 'Can Explain', emoji: '🚀', desc: 'Mastered & ready to help', color: 'hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-300 border-slate-700 bg-slate-800' },
];

export default function ActivePulseCard({ pulse, onSubmitResponse, userResponse }) {
  const [selected, setSelected] = useState(userResponse || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (optKey) => {
    setSelected(optKey);
    setSubmitting(true);
    try {
      await onSubmitResponse?.(optKey);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Active Classroom Pulse</span>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{pulse.topic}</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">{pulse.prompt}</h2>
        <p className="text-xs text-slate-400">Select your current confidence level. Anonymous to teacher.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <button
              key={opt.key}
              disabled={submitting}
              onClick={() => handleSelect(opt.key)}
              className={`flex items-start p-4 rounded-2xl border-2 transition-all duration-200 text-left space-x-3 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500/50'
                  : opt.color
              }`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <div>
                <span className="block font-bold text-sm text-slate-100">{opt.label}</span>
                <span className="text-xs text-slate-400">{opt.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
