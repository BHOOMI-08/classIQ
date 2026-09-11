import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, ShieldAlert, AlertCircle, Play, CheckCircle, FileText } from 'lucide-react';
import quizService from '../../../services/quiz.service';

export default function QuizInstructionsPage() {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [qRes, eRes] = await Promise.all([
        quizService.getQuiz(quizId),
        quizService.getEligibility(quizId),
      ]);
      setQuiz(qRes.data);
      setEligibility(eRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load assessment instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttempt = async () => {
    setStarting(true);
    try {
      const res = await quizService.startAttempt(quizId);
      const attemptId = res.data.attempt._id;
      navigate(`/student/classrooms/${classId}/quizzes/${quizId}/attempt/${attemptId}`);
    } catch (err) {
      alert(err.message || 'Failed to start attempt session');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Resolving server authorization & timers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <button
          onClick={() => navigate(`/student/classrooms/${classId}/quizzes`)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {quiz?.quizType || 'graded'} • {quiz?.difficulty || 'medium'}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-100">{quiz?.title}</h1>
            <p className="text-xs text-slate-400">{quiz?.description || 'Please read all assessment instructions before starting.'}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Duration</div>
              <div className="text-sm font-bold text-slate-200 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> {quiz?.durationMinutes} Mins
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Marks</div>
              <div className="text-sm font-bold text-indigo-400 flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" /> {quiz?.totalMarks} Marks
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Attempt Limit</div>
              <div className="text-sm font-bold text-slate-200">{quiz?.attemptLimit} Attempt(s)</div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Assessment Rules & Guidelines
            </h3>
            <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
              <li>Server-authoritative timer begins immediately upon clicking 'Start Attempt'.</li>
              <li>Your answers autosave periodically and on question navigation.</li>
              <li>Closing the browser tab or refreshing will NOT stop your session timer.</li>
              <li>When time expires, your answers will be automatically submitted server-side.</li>
              {quiz?.negativeMarkingEnabled && <li className="text-amber-400 font-semibold">Negative marking is enabled for incorrect objective responses.</li>}
              {quiz?.tabSwitchMonitoringEnabled && <li className="text-amber-400 font-semibold">Security monitoring is active for tab switching and window focus exits.</li>}
            </ul>
          </div>

          {error ? (
            <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          ) : !eligibility?.eligible ? (
            <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" /> Quiz Not Available: {eligibility?.reason}
            </div>
          ) : (
            <button
              onClick={handleStartAttempt}
              disabled={starting}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-950/50 border border-indigo-400/30 flex items-center justify-center gap-2 transition"
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Starting Attempt...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start Secure Assessment Attempt
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
