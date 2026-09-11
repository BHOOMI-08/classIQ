import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Download, Layers, CheckCircle2, Bookmark } from 'lucide-react';
import aiService from '../../../services/aiService';
import Flashcard from '../components/Flashcard';
import RevisionCard from '../components/RevisionCard';

export default function RevisionPage() {
  const [classroomId, setClassroomId] = useState('');
  const [topic, setTopic] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [revisionType, setRevisionType] = useState('revision_pack');
  const [generatedAsset, setGeneratedAsset] = useState(null);
  const [revisionsList, setRevisionsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
    try {
      const res = await aiService.getRevisions();
      const list = res.data?.assets || [];
      setRevisionsList(list);
      if (list.length > 0) {
        setGeneratedAsset(list[0]);
      }
    } catch (_) {}
  };

  const handleGenerateRevision = async (e) => {
    e.preventDefault();
    if (!classroomId || !topic) {
      return alert('Please enter both Classroom ID and Topic');
    }

    setLoading(true);

    try {
      const res = await aiService.generateRevisionAsset({
        classroomId,
        topic,
        resourceId: resourceId || null,
        revisionType,
      });

      const newAsset = res.data?.asset;
      if (newAsset) {
        setGeneratedAsset(newAsset);
        setRevisionsList([newAsset, ...revisionsList]);
      }
    } catch (err) {
      alert(err.message || 'Failed to generate revision asset');
    } finally {
      setLoading(false);
    }
  };

  const flashcards = generatedAsset?.structuredContent?.flashcards || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Smart Grounded Revision Generator</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Generates flashcards, one-page summaries, exam questions, formula sheets, and checklists strictly from teacher-uploaded resources.
            </p>
          </div>
        </div>

        {/* Form Selection */}
        <form onSubmit={handleGenerateRevision} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Select Classroom & Topic
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Classroom ID *</label>
              <input
                type="text"
                required
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                placeholder="Paste Classroom ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Topic / Unit *</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Relational Algebra or Unit 3"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Specific Resource ID (Optional)</label>
              <input
                type="text"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                placeholder="Leave blank for all topic notes"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Retrieving & Generating...' : 'Generate Revision Assets'}</span>
            </button>
          </div>
        </form>

        {/* Display Area: Flashcards & Revision Cards */}
        {generatedAsset ? (
          <div className="space-y-8">
            {/* Interactive Flashcard Deck */}
            {flashcards.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider text-center">
                  Interactive Grounded Flashcards ({flashcards.length})
                </h3>
                <Flashcard cards={flashcards} />
              </div>
            )}

            {/* Complete Grounded Revision Package */}
            <RevisionCard asset={generatedAsset} />
          </div>
        ) : (
          <div className="py-16 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No revision asset selected</h4>
            <p className="text-xs text-slate-400">Fill in the classroom ID and topic to generate smart flashcards and summaries.</p>
          </div>
        )}
      </div>
    </div>
  );
}
