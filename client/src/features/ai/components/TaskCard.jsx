import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

export default function TaskCard({ task, onUpdateStatus }) {
  if (!task) return null;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'urgent_critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'medium':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700';
    }
  };

  const isCompleted = task.status === 'completed';
  const isSkipped = task.status === 'skipped';

  return (
    <div
      className={`p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between space-y-3 ${
        isCompleted
          ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
          : isSkipped
          ? 'bg-slate-900/30 border-slate-800/40 opacity-40'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getPriorityStyle(task.priorityLabel)}`}>
              {task.priorityLabel?.replace('_', ' ') || 'Normal'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" /> {task.startTime || '09:00'} ({task.durationMinutes || 45} mins)
            </span>
          </div>
          <h4 className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
            {task.title}
          </h4>
          {task.description && <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>}
        </div>

        {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isSkipped && <XCircle className="w-5 h-5 text-slate-500 shrink-0" />}
      </div>

      {!isCompleted && !isSkipped && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
          <button
            onClick={() => onUpdateStatus(task._id, 'skipped')}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-800 transition"
          >
            Skip
          </button>
          <button
            onClick={() => onUpdateStatus(task._id, 'completed')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition shadow flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> Mark Done
          </button>
        </div>
      )}
    </div>
  );
}
