import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, RefreshCw, AlertCircle, Award, ChevronRight, Filter } from 'lucide-react';
import aiService from '../../../services/aiService';

export default function StudyPlannerPage() {
  const [studyPlan, setStudyPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classroomIdInput, setClassroomIdInput] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStudyPlan();
  }, []);

  const fetchStudyPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getStudyPlan();
      setStudyPlan(res.data.studyPlan);
      setTasks(res.data.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!classroomIdInput) return alert('Please enter classroom ID');
    setGenerating(true);
    try {
      const res = await aiService.generateStudyPlan({
        classroomIds: [classroomIdInput],
        dailyAvailableMinutes: 120,
      });
      setStudyPlan(res.data.studyPlan);
      setTasks(res.data.tasks || []);
    } catch (err) {
      alert(err.message || 'Failed to generate study plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await aiService.updateStudyTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading personalized study plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-200 to-sky-300 bg-clip-text text-transparent">
                Personalized AI Study Planner
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Deterministic priority scoring combined with Gemini schedule optimization</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={classroomIdInput}
              onChange={(e) => setClassroomIdInput(e.target.value)}
              placeholder="Paste Classroom ID"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
            />
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
            >
              {generating ? 'Generating...' : 'Generate New Plan'}
            </button>
          </div>
        </div>

        {/* Tasks View */}
        {tasks.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No active study schedule</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Enter your classroom ID above and click 'Generate New Plan' to build your personalized schedule.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Scheduled Daily Tasks</span>
              <span className="text-xs font-semibold text-indigo-400">
                {tasks.filter((t) => t.status === 'completed').length} / {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition ${
                    task.status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTaskStatus(task._id, task.status)}
                      className={`p-1.5 rounded-lg border transition ${
                        task.status === 'completed'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                          task.priorityLabel === 'urgent_critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                          task.priorityLabel === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          Priority: {task.priorityScore}
                        </span>
                        <span className="text-xs font-bold text-slate-100 line-clamp-1">{task.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{task.description}</p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="font-semibold text-indigo-400">{task.durationMinutes} mins</div>
                    <div className="text-[10px] text-slate-500 uppercase">{task.type?.replace('_', ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
