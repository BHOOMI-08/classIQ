import React, { useState } from 'react';
import { Download, Bookmark, CheckCircle, FileText, HelpCircle, Layers, ListChecks } from 'lucide-react';

export default function RevisionCard({ asset, onSave, onBookmark, onDownload }) {
  const [completedItems, setCompletedItems] = useState(new Set());

  if (!asset) return null;

  const content = asset.structuredContent || {};

  const toggleCheck = (idx) => {
    const nextSet = new Set(completedItems);
    if (nextSet.has(idx)) nextSet.delete(idx);
    else nextSet.add(idx);
    setCompletedItems(nextSet);
  };

  const handleDownloadFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(asset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${asset.title || 'revision_asset'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onDownload) onDownload(asset._id);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Grounded Revision Asset
          </span>
          <h3 className="text-base font-bold text-slate-100">{asset.title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBookmark}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
            title="Bookmark Asset"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={handleDownloadFile}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      {/* 1-Page Summary Section */}
      {content.summary && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-sky-400" /> Executive One-Page Summary
          </h4>
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed">
            {content.summary}
          </div>
        </div>
      )}

      {/* Formula Sheet / Key Definitions */}
      {content.formulaSheet && content.formulaSheet.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> Formula & Concept Sheet
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {content.formulaSheet.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <span className="font-bold text-indigo-300">{item.name}</span>
                <p className="font-mono text-emerald-400 bg-slate-900 p-1.5 rounded">{item.formula}</p>
                <p className="text-[11px] text-slate-400">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Questions */}
      {content.importantQuestions && content.importantQuestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" /> Important Exam Questions
          </h4>
          <div className="space-y-2">
            {content.importantQuestions.map((q, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Q{idx + 1}: {q.question}</span>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                    {q.difficulty || 'medium'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-900">
                  <span className="font-semibold text-slate-300">Answer:</span> {q.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision Checklist */}
      {content.revisionChecklist && content.revisionChecklist.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-amber-400" /> Topic Revision Checklist
          </h4>
          <div className="space-y-1.5">
            {content.revisionChecklist.map((item, idx) => (
              <label
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`flex items-center gap-2.5 p-2.5 bg-slate-950 border rounded-xl text-xs cursor-pointer transition ${
                  completedItems.has(idx) ? 'border-emerald-800/80 text-slate-400 line-through' : 'border-slate-800 text-slate-200'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${completedItems.has(idx) ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>{item.item || item}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
