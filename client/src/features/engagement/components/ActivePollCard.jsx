import React, { useState } from 'react';

export default function ActivePollCard({ poll, options = [], onSubmitResponse }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleOption = (optId) => {
    if (poll.type === 'multiple_choice') {
      setSelectedIds((prev) =>
        prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
      );
    } else {
      setSelectedIds([optId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await onSubmitResponse?.({ selectedOptionIds: selectedIds });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Live Poll</span>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{poll.topic}</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">{poll.question}</h2>
        {poll.description && <p className="text-xs text-slate-400">{poll.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = selectedIds.includes(opt._id);
            return (
              <button
                type="button"
                key={opt._id}
                disabled={submitted || loading}
                onClick={() => toggleOption(opt._id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left font-medium text-sm ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{opt.text}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600'}`}>
                  {isSelected && <span className="text-xs font-bold">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button
            type="submit"
            disabled={selectedIds.length === 0 || loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center font-bold text-sm">
            ✓ Your response has been recorded!
          </div>
        )}
      </form>
    </div>
  );
}
