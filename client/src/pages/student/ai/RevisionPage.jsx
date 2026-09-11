import React, { useState } from 'react';
import { Zap, BookOpen, Layers, CheckCircle, FileText, Download, Sparkles } from 'lucide-react';
import aiService from '../../../services/aiService';

export default function RevisionPage() {
  const [classroomId, setClassroomId] = useState('');
  const [topic, setTopic] = useState('');
  const [revisionType, setRevisionType] = useState('flashcards');
  const [loading, setLoading] = useState(false);
  const [generatedRevision, setGeneratedRevision] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!classroomId || !topic) return alert('Classroom ID and Topic are required');

    setLoading(true);
    try {
      const res = await aiService.generateRevisionAsset({
        classroomId,
        topic,
        revisionType,
      });
      setGeneratedRevision(res.data.revision);
    } catch (err) {
      alert(err.message || 'Failed to generate revision material');
    } finally {
      setLoading(false);
    }
  };

  const revisionData = generatedRevision?.structuredContent || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-100">Smart Revision Generator</h1>
              <p className="text-xs text-slate-400">Generate grounded flashcards, 1-page summaries, formula sheets & important questions</p>
            </div>
          </div>
        </div>

        {/* Form and Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleGenerate} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Asset Settings</h3>

            <div>
              <label className="text-slate-400">Classroom ID</label>
              <input
                type="text"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                placeholder="Paste Classroom ID"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-slate-400">Target Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Normalization & 3NF"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-slate-400">Asset Type</label>
              <select
                value={revisionType}
                onChange={(e) => setRevisionType(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
              >
                <option value="flashcards">Flashcards</option>
                <option value="one_page_summary">One-Page Executive Summary</option>
                <option value="formula_sheet">Formula & Cheat Sheet</option>
                <option value="important_questions">Important Practice Questions</option>
                <option value="topic_checklist">Topic Mastery Checklist</option>
                <option value="common_mistakes">Common Mistakes Sheet</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {loading ? 'Generating Material...' : 'Generate Revision Pack'}
            </button>
          </form>

          {/* Results Output */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            {!generatedRevision ? (
              <div className="py-20 text-center space-y-3">
                <Zap className="w-12 h-12 text-slate-700 mx-auto" />
                <h3 className="text-base font-bold text-slate-400">No Revision Material Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a topic and asset type to generate high-yield grounded revision items.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">{revisionData.title || generatedRevision.title}</h2>
                    <span className="text-xs font-semibold text-purple-400 uppercase">{revisionType.replace('_', ' ')}</span>
                  </div>
                </div>

                {revisionData.summary && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                    <div className="font-bold text-purple-300 mb-1">Executive Summary:</div>
                    <p className="whitespace-pre-wrap">{revisionData.summary}</p>
                  </div>
                )}

                {/* Items */}
                {revisionData.items && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Revision Flashcards & Key Takeaways</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {revisionData.items.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                          <div className="font-bold text-slate-100">Q: {item.front}</div>
                          <div className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                            A: {item.back}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
