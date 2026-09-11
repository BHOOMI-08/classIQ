import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { pulseService } from '../../services/pulseService.js';
import { useEngagementSocket } from '../../hooks/useEngagementSocket.js';
import PulseDistributionChart from '../../components/PulseDistributionChart.jsx';

export default function TeacherPulsePage() {
  const { classId } = useParams();
  const [pulses, setPulses] = useState([]);
  const [activePulse, setActivePulse] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('How confident are you with this topic?');
  const [loading, setLoading] = useState(false);

  const fetchPulses = useCallback(async () => {
    try {
      const res = await pulseService.getClassroomPulses(classId);
      const list = res.data?.pulses || [];
      setPulses(list);
      const active = list.find((p) => p.status === 'active');
      if (active) {
        setActivePulse(active);
        const analyticsRes = await pulseService.getPulseById(active._id);
        setAnalytics(analyticsRes.data);
      }
    } catch (_) {}
  }, [classId]);

  useEffect(() => {
    fetchPulses();
  }, [fetchPulses]);

  const handleSocketEvent = useCallback((event, data) => {
    if (event === 'pulse-started' || event === 'pulse-updated' || event === 'pulse-closed') {
      fetchPulses();
    }
  }, [fetchPulses]);

  useEngagementSocket(classId, handleSocketEvent);

  const handleStartPulse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pulseService.createPulse(classId, { topic, prompt, durationMinutes: 5 });
      setTopic('');
      fetchPulses();
    } finally {
      setLoading(false);
    }
  };

  const handleClosePulse = async () => {
    if (!activePulse) return;
    try {
      await pulseService.closePulse(activePulse._id);
      setActivePulse(null);
      setAnalytics(null);
      fetchPulses();
    } catch (_) {}
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Classroom Pulse Control</h1>
          <p className="text-sm text-slate-400">Start quick real-time confidence checks during lecture</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Start Pulse Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-100">Start New Confidence Pulse</h2>
          <form onSubmit={handleStartPulse} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Topic</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Thermodynamics / Vector Search"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Prompt Question</label>
              <input
                type="text"
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all disabled:opacity-50"
            >
              {loading ? 'Starting Pulse...' : '🚀 Start 5-Min Pulse Now'}
            </button>
          </form>
        </div>

        {/* Live Active Pulse Dashboard */}
        {activePulse ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Session: {activePulse.topic}</span>
              <button
                onClick={handleClosePulse}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                End Pulse Now
              </button>
            </div>
            {analytics && (
              <PulseDistributionChart
                counts={analytics.counts}
                percentages={analytics.percentages}
                confidenceIndex={analytics.confidenceIndex}
                confidenceLabel={analytics.confidenceLabel}
                totalResponses={analytics.totalResponses}
              />
            )}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
            <span className="text-4xl">📊</span>
            <p className="text-sm">No active pulse session right now. Launch one above to gauge student understanding in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
