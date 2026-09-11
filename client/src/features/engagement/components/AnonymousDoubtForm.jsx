import React, { useState } from 'react';

export default function AnonymousDoubtForm({ onSubmitDoubt, matchingDoubts = [] }) {
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitDoubt?.({ text, topic });
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Ask Anonymous Doubt</h2>
          <p className="text-xs text-slate-400">Identity is completely hidden from your teacher and classmates</p>
        </div>
        <span className="text-2xl">🔒</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Topic (Optional)</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Thermodynamics / Vector Search"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Your Question / Doubt</label>
          <textarea
            required
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What part of the lecture did you find confusing?"
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {matchingDoubts.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider block">⚡ Similar Doubt Found!</span>
            <p className="text-xs">A classmate asked something similar. You can upvote existing doubts below instead of posting duplicate text:</p>
            <div className="space-y-1 pt-1">
              {matchingDoubts.map((m) => (
                <div key={m._id} className="text-xs bg-slate-900/60 p-2 rounded-xl border border-amber-500/20">
                  "{m.text}" ({m.upvoteCount} upvotes)
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all duration-200 disabled:opacity-50"
        >
          {submitting ? 'Submitting Anonymously...' : 'Submit Anonymous Doubt'}
        </button>
      </form>
    </div>
  );
}
