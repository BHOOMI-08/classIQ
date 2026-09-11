import React from 'react';

export default function DoubtCard({ doubt, onUpvote, onResolve, isTeacher = false }) {
  const isResolved = doubt.status === 'resolved';

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-200 space-y-4 ${
      isResolved
        ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-md">
            {doubt.topic || 'General'}
          </span>
          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
            Priority {doubt.priorityScore}
          </span>
        </div>

        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
          isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
        }`}>
          {doubt.status}
        </span>
      </div>

      <p className="text-sm text-slate-100 font-medium leading-relaxed">{doubt.text}</p>

      {doubt.resolutionNote && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <strong className="block font-bold">Teacher Resolution Note:</strong>
          {doubt.resolutionNote}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpvote?.(doubt._id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all"
          >
            <span>👍</span>
            <span>{doubt.upvoteCount} Upvotes</span>
          </button>
        </div>

        {isTeacher && !isResolved && (
          <button
            onClick={() => onResolve?.(doubt._id)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}
