import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, ChevronRight, BookOpen, Zap } from 'lucide-react';
import aiService from '../../../services/aiService';

export default function WeaknessMapPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classroomId, setClassroomId] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    fetchWeaknessMap();
  }, []);

  const fetchWeaknessMap = async () => {
    setLoading(true);
    try {
      const res = await aiService.getWeaknessMap(classroomId);
      setProfile(res.data.profile);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const topics = profile?.topics || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-200 to-amber-300 bg-clip-text text-transparent">
                Topic Weakness & Mastery Map
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Real evidence scoring calculated from quiz accuracy, assignment performance, and practice</p>
            </div>
          </div>

          <button
            onClick={fetchWeaknessMap}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Recalculate Mastery"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Topic Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent"></div>
            <p className="text-sm text-slate-400">Computing topic mastery profiles...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
            <Target className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">No topic mastery data found</h3>
            <p className="text-xs text-slate-500">Attempt quizzes and submit assignments to generate your weakness map.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-100">{item.topic}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                    item.classification === 'strong' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    item.classification === 'developing' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                    item.classification === 'weak' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {item.classification} ({item.masteryScore}%)
                  </span>
                </div>

                {/* Evidence Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">Quiz Accuracy</div>
                    <div className="font-bold text-slate-200">{item.evidence?.quizAccuracyPercentage}%</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">Assignments</div>
                    <div className="font-bold text-indigo-400">{item.evidence?.assignmentTopicScore}%</div>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500">Trend</div>
                    <div className="font-bold text-emerald-400 capitalize">{item.trend}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <strong className="text-slate-300">Action:</strong> {item.recommendedAction}
                </p>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => navigate('/student/revision')}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition"
                  >
                    <Zap className="w-3.5 h-3.5" /> Generate Revision Pack
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
