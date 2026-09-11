import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import aiService from '../../../services/aiService';
import StudyPlanCalendar from '../components/StudyPlanCalendar';

export default function StudyPlannerPage() {
  const [dailyHours, setDailyHours] = useState(2);
  const [examDate, setExamDate] = useState('');
  const [weakTopicsInput, setWeakTopicsInput] = useState('');
  const [studyPlan, setStudyPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const fetchActivePlan = async () => {
    try {
      const res = await aiService.getStudyPlan();
      if (res.data?.studyPlan) {
        setStudyPlan(res.data.studyPlan);
        setTasks(res.data.tasks || []);
      }
    } catch (_) {}
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const weakTopics = weakTopicsInput
        ? weakTopicsInput.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const res = await aiService.generateStudyPlan({
        dailyAvailableHours: Number(dailyHours),
        examDates: examDate ? [{ subject: 'Upcoming Midterm/Final', date: examDate }] : [],
        weakTopics,
      });

      setStudyPlan(res.data?.studyPlan);
      setTasks(res.data?.tasks || []);
    } catch (err) {
      alert(err.message || 'Failed to generate AI study plan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await aiService.updateStudyTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleRecalculate = async (planId) => {
    if (!planId) return;
    setLoading(true);
    try {
      const res = await aiService.recalculateStudyPlan(planId);
      setStudyPlan(res.data?.studyPlan);
      setTasks(res.data?.tasks || []);
    } catch (err) {
      alert(err.message || 'Failed to recalculate study plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">AI Adaptive Study Planner</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Analyzes your attendance rate, assignment deadlines, quiz scores, and weak topics to generate a prioritized, daily study roadmap.
            </p>
          </div>
        </div>

        {/* Inputs Card */}
        <form onSubmit={handleGeneratePlan} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Plan Parameters & Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Daily Study Hours</label>
              <input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Next Major Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Weak Topics (Comma separated)</label>
              <input
                type="text"
                value={weakTopicsInput}
                onChange={(e) => setWeakTopicsInput(e.target.value)}
                placeholder="e.g. Normalization, Binary Trees"
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
              <span>{loading ? 'Calculating Priorities...' : 'Generate AI Study Plan'}</span>
            </button>
          </div>
        </form>

        {/* Study Plan Calendar & Task Cards */}
        <StudyPlanCalendar
          studyPlan={studyPlan}
          tasks={tasks}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onRecalculate={handleRecalculate}
        />
      </div>
    </div>
  );
}
