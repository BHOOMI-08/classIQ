import React from 'react';
import { Calendar, Clock, Award, Flame, RefreshCw } from 'lucide-react';
import TaskCard from './TaskCard';

export default function StudyPlanCalendar({ studyPlan, tasks = [], onUpdateTaskStatus, onRecalculate }) {
  if (!studyPlan && tasks.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
        <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
        <h4 className="text-sm font-bold text-slate-300">No active study plan generated yet</h4>
        <p className="text-xs text-slate-400">Fill in your exam dates & available hours above to generate your roadmap.</p>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner & Stats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100">{studyPlan?.title || 'Personalized Academic Roadmap'}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              Active Roadmap
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automatically prioritized based on attendance health, upcoming assignment deadlines & quiz dates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Completion</span>
            <p className="text-base font-extrabold text-emerald-400">{completionPercentage}% Completed</p>
          </div>

          <button
            onClick={() => onRecalculate(studyPlan?._id)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate Schedule</span>
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-sky-400" /> Planned Study & Revision Tasks ({tasks.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onUpdateStatus={onUpdateTaskStatus} />
          ))}
        </div>
      </div>
    </div>
  );
}
