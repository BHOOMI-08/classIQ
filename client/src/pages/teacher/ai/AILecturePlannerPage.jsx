import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ArrowLeft, Plus, CheckCircle, Zap, Layers, FileText, ChevronRight } from 'lucide-react';
import aiService from '../../../services/aiService';

export default function AILecturePlannerPage() {
  const navigate = useNavigate();

  const [classroomId, setClassroomId] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [style, setStyle] = useState('interactive');
  const [outcomeInput, setOutcomeInput] = useState('');
  const [outcomes, setOutcomes] = useState(['Understand core concepts', 'Solve practice examples']);

  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [converting, setConverting] = useState(false);

  const handleAddOutcome = () => {
    if (outcomeInput.trim()) {
      setOutcomes([...outcomes, outcomeInput.trim()]);
      setOutcomeInput('');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!classroomId || !topic) return alert('Classroom ID and Topic are required');

    setLoading(true);
    try {
      const res = await aiService.generateLecturePlan({
        classroomId,
        topic,
        lectureDurationMinutes: Number(duration),
        difficultyLevel: difficulty,
        teachingStyle: style,
        learningOutcomes: outcomes,
      });
      setGeneratedPlan(res.data.lecturePlan);
    } catch (err) {
      alert(err.message || 'Failed to generate lecture plan');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToQuiz = async () => {
    if (!generatedPlan) return;
    setConverting(true);
    try {
      const res = await aiService.convertLecturePlanToQuiz(generatedPlan._id);
      alert(`Quiz draft created with ${res.data.questionCount} questions! Redirecting to classroom quizzes...`);
      navigate(`/teacher/classes/${classroomId}/quizzes`);
    } catch (err) {
      alert(err.message || 'Failed to convert to quiz draft');
    } finally {
      setConverting(false);
    }
  };

  const planData = generatedPlan?.structuredContent || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/teacher/ai-tools')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to AI Tools Hub
        </button>

        {/* Header */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-600/20 text-sky-400 rounded-xl border border-sky-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-100">AI Lecture Planner</h1>
              <p className="text-xs text-slate-400">Design structured, time-budgeted lecture plans with embedded activities</p>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleGenerate} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Plan Parameters</h3>

            <div>
              <label className="text-slate-400">Classroom ID</label>
              <input
                type="text"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                placeholder="Paste Classroom ID"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-slate-400">Lecture Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Binary Search Trees & Balancing"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">Duration (Mins)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400">Learning Outcomes</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={outcomeInput}
                  onChange={(e) => setOutcomeInput(e.target.value)}
                  placeholder="Add outcome..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                />
                <button type="button" onClick={handleAddOutcome} className="p-2.5 bg-slate-800 text-slate-200 rounded-xl">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {outcomes.map((o, idx) => (
                  <li key={idx} className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-sky-400" /> {o}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {loading ? 'Designing Lecture Plan...' : 'Generate Lecture Plan'}
            </button>
          </form>

          {/* Results Output */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            {!generatedPlan ? (
              <div className="py-20 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-700 mx-auto" />
                <h3 className="text-base font-bold text-slate-400">No Lecture Plan Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Fill in the plan parameters on the left to generate a minute-by-minute lecture flow.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">{planData.title || generatedPlan.title}</h2>
                    <p className="text-xs text-slate-400">Estimated Duration: {duration} Mins</p>
                  </div>

                  {planData.quickAssessment && planData.quickAssessment.length > 0 && (
                    <button
                      onClick={handleConvertToQuiz}
                      disabled={converting}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5" /> {converting ? 'Converting...' : 'Convert to Quiz Draft'}
                    </button>
                  )}
                </div>

                {/* Segments Timeline */}
                {planData.segments && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Minute-by-Minute Timeline</h3>
                    <div className="space-y-3">
                      {planData.segments.map((seg, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                          <div className="flex justify-between font-bold text-slate-200">
                            <span>{idx + 1}. {seg.title}</span>
                            <span className="text-indigo-400">{seg.durationMinutes} mins</span>
                          </div>
                          {seg.teachingPoints && (
                            <ul className="list-disc list-inside text-slate-400 space-y-1">
                              {seg.teachingPoints.map((pt, pIdx) => (
                                <li key={pIdx}>{pt}</li>
                              ))}
                            </ul>
                          )}
                          {seg.activity && (
                            <div className="p-2.5 bg-sky-950/40 border border-sky-800/60 rounded-lg text-sky-300">
                              Activity: {seg.activity}
                            </div>
                          )}
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
