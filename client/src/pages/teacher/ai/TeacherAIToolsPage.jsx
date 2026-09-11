import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, FileText, Megaphone, BarChart2, ChevronRight, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import aiService from '../../../services/aiService';

export default function TeacherAIToolsPage() {
  const navigate = useNavigate();
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [summaryModal, setSummaryModal] = useState(false);

  // Form states
  const [classId, setClassId] = useState('');
  const [announcementPrompt, setAnnouncementPrompt] = useState('');
  const [announcementTone, setAnnouncementTone] = useState('professional');
  const [generatedAnnouncement, setGeneratedAnnouncement] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAnnouncement = async (e) => {
    e.preventDefault();
    if (!classId || !announcementPrompt) return alert('Please enter classroom ID and prompt');
    setLoading(true);
    try {
      const res = await aiService.generateAnnouncement({
        classroomId: classId,
        prompt: announcementPrompt,
        tone: announcementTone,
      });
      setGeneratedAnnouncement(res.data.announcement);
    } catch (err) {
      alert(err.message || 'Failed to generate announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClassSummary = async (e) => {
    e.preventDefault();
    if (!classId) return alert('Please enter classroom ID');
    setLoading(true);
    try {
      const res = await aiService.generateClassSummary({ classroomId: classId });
      setGeneratedSummary(res.data.summary);
    } catch (err) {
      alert(err.message || 'Failed to generate class summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl space-y-3 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">ClassIQ Intelligence Layer</span>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-200 via-sky-200 to-white bg-clip-text text-transparent">
                Teacher AI Tools Hub
              </h1>
            </div>
          </div>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
            Centralized productivity suite powered by RAG-grounded Gemini AI. Generate assignments, quizzes, lecture plans, announcements, and class health summaries.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Lecture Planner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition shadow-lg group">
            <div className="space-y-3">
              <div className="p-3 w-fit bg-sky-950 text-sky-400 rounded-xl border border-sky-800">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition">AI Lecture Planner</h3>
              <p className="text-xs text-slate-400">
                Design minute-by-minute lecture timelines, learning outcomes, interactive activities, and convert assessments directly into quiz drafts.
              </p>
            </div>
            <button
              onClick={() => navigate('/teacher/lecture-planner')}
              className="mt-6 w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition"
            >
              Open Lecture Planner <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: AI Assignment Generator (Module 5 shortcut) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition shadow-lg group">
            <div className="space-y-3">
              <div className="p-3 w-fit bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-800">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition">AI Assignment Generator</h3>
              <p className="text-xs text-slate-400">
                Generate rubric-aligned coursework, programming tasks, and essay prompts grounded in teacher notes (Module 5).
              </p>
            </div>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition"
            >
              Open Assignment Suite <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: AI Quiz Generator (Module 6 shortcut) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition shadow-lg group">
            <div className="space-y-3">
              <div className="p-3 w-fit bg-purple-950 text-purple-400 rounded-xl border border-purple-800">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition">AI Quiz & Test Generator</h3>
              <p className="text-xs text-slate-400">
                Generate auto-graded MCQs, short answer, and coding assessments directly from PDF notes and topics (Module 6).
              </p>
            </div>
            <button
              onClick={() => navigate('/teacher/classes')}
              className="mt-6 w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition"
            >
              Open Quiz Suite <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Announcement Writer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition shadow-lg group">
            <div className="space-y-3">
              <div className="p-3 w-fit bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition">AI Announcement Writer</h3>
              <p className="text-xs text-slate-400">
                Draft professional, encouraging, or urgent classroom announcements with push notification versions.
              </p>
            </div>
            <button
              onClick={() => setAnnouncementModal(true)}
              className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition"
            >
              Draft Announcement <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 5: Class Health Summary */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition shadow-lg group">
            <div className="space-y-3">
              <div className="p-3 w-fit bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition">AI Class Summary</h3>
              <p className="text-xs text-slate-400">
                Synthesize attendance trends, assignment completion, and quiz topic weaknesses into actionable teacher recommendations.
              </p>
            </div>
            <button
              onClick={() => setSummaryModal(true)}
              className="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition"
            >
              Generate Health Summary <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT MODAL */}
      {announcementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Draft AI Announcement</h3>
            <form onSubmit={handleGenerateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Classroom ID</label>
                <input
                  type="text"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  placeholder="Paste Classroom ID"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400">Tone</label>
                <select
                  value={announcementTone}
                  onChange={(e) => setAnnouncementTone(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="urgent">Urgent</option>
                  <option value="encouraging">Encouraging</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Announcement Prompt / Short Note</label>
                <textarea
                  rows={3}
                  value={announcementPrompt}
                  onChange={(e) => setAnnouncementPrompt(e.target.value)}
                  placeholder="e.g. Midterm exam pushed to Friday. Review Chapter 4 notes."
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setAnnouncementModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow">
                  {loading ? 'Generating...' : 'Generate Draft'}
                </button>
              </div>
            </form>

            {generatedAnnouncement && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 mt-3">
                <div className="font-bold text-slate-100">{generatedAnnouncement.title}</div>
                <p className="whitespace-pre-wrap">{generatedAnnouncement.content || generatedAnnouncement.structuredContent?.announcement}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUMMARY MODAL */}
      {summaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Generate Class Executive Summary</h3>
            <form onSubmit={handleGenerateClassSummary} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Classroom ID</label>
                <input
                  type="text"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  placeholder="Paste Classroom ID"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSummaryModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow">
                  {loading ? 'Analyzing Stats...' : 'Generate Summary'}
                </button>
              </div>
            </form>

            {generatedSummary && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 max-h-60 overflow-y-auto mt-3">
                <div className="font-bold text-amber-400">{generatedSummary.title}</div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300">{generatedSummary.content}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
