import React from 'react';

export default function DoubtClusterCard({ cluster }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-1 rounded-md border border-indigo-500/30">
          Cluster ({cluster.memberCount} Doubts)
        </span>
        <span className="text-xs text-amber-400 font-bold">Total Upvotes: {cluster.totalUpvotes}</span>
      </div>

      <h4 className="text-sm font-bold text-slate-100">{cluster.title}</h4>
      <div className="text-xs text-slate-400">Topic: {cluster.topic}</div>
    </div>
  );
}
