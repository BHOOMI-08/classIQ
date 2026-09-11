import React from 'react';
import { BookOpen, FileText, CheckCircle } from 'lucide-react';

export default function CitationList({ citations = [] }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-indigo-400" />
          Grounded Citations ({citations.length})
        </span>
        <span className="text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle className="w-2.5 h-2.5" /> 100% Grounded
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {citations.map((cite, idx) => (
          <div
            key={idx}
            className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs flex flex-col justify-between hover:border-indigo-500/40 transition"
          >
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold truncate">
              <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{cite.resourceTitle || 'Classroom Material'}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Page {cite.pageNumber || 1}</span>
              {cite.sectionTitle && <span className="italic truncate max-w-[120px]">{cite.sectionTitle}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
