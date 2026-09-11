import React, { useState } from 'react';

const MODULE_BADGES = {
  attendance: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  content: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  assignments: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  quizzes: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  engagement: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  announcements: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  ai: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export default function ClassroomTimeline({ activities = [], onFilterChange, selectedModule = 'all' }) {
  const MODULES = ['all', 'attendance', 'content', 'assignments', 'quizzes', 'engagement', 'announcements', 'ai'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>📜</span>
            <span>Classroom Activity Timeline</span>
          </h2>
          <p className="text-xs text-slate-400">Unified activity stream across all 8 ClassIQ modules</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MODULES.map((m) => (
            <button
              key={m}
              onClick={() => onFilterChange?.(m)}
              className={`text-xs px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                selectedModule === m
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6">
        {activities.map((act) => {
          const badgeClass = MODULE_BADGES[act.sourceModule] || MODULE_BADGES.engagement;
          return (
            <div key={act._id} className="relative space-y-1">
              <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-indigo-500 border-4 border-slate-900" />
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                  {act.sourceModule}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(act.occurredAt).toLocaleString()}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">{act.title}</h4>
              {act.summary && <p className="text-xs text-slate-300">{act.summary}</p>}
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="text-xs text-slate-500 italic py-4">No activity events recorded yet.</div>
        )}
      </div>
    </div>
  );
}
