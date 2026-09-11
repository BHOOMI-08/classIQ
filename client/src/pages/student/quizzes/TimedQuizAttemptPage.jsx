import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, Flag, CheckCircle, Save, AlertTriangle, Send, ChevronLeft, ChevronRight, Code, FileText, Layers } from 'lucide-react';
import quizService from '../../../services/quiz.service';

export default function TimedQuizAttemptPage() {
  const { classId, quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionSnapshotId: { selectedOptionIds, textAnswer, codeAnswer, isFlagged } }
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const clientSeqRef = useRef({});

  useEffect(() => {
    loadAttemptState();
  }, [attemptId]);

  // Tab switch listener for cheating signals
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && attempt) {
        quizService.trackEvent(attemptId, {
          eventType: 'tab_hidden',
          clientTimestamp: new Date(),
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attemptId, attempt]);

  // Server-authoritative Timer Countdown
  useEffect(() => {
    if (!attempt || !attempt.expiresAt) return;

    const updateTimer = () => {
      const expires = new Date(attempt.expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingSeconds(diff);

      if (diff === 0 && attempt.status === 'in_progress') {
        handleAutoSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [attempt]);

  const loadAttemptState = async () => {
    setLoading(true);
    try {
      const res = await quizService.getAttemptState(attemptId);
      setAttempt(res.data.attempt);
      setQuestions(res.data.questions || []);

      // Initialize answers from server state if resuming
      const initialAnswers = {};
      (res.data.questions || []).forEach((q) => {
        initialAnswers[q._id] = {
          selectedOptionIds: [],
          booleanAnswer: null,
          textAnswer: '',
          codeAnswer: q.codingConfigSnapshot?.starterCode || '',
          isFlagged: false,
        };
      });
      setAnswers(initialAnswers);
    } catch (err) {
      alert(err.message || 'Failed to load assessment attempt state');
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleAnswerChange = (qId, updatedFields) => {
    const newAnswer = { ...answers[qId], ...updatedFields };
    setAnswers((prev) => ({ ...prev, [qId]: newAnswer }));

    // Increment client sequence for anti-stale save
    const currentSeq = (clientSeqRef.current[qId] || 0) + 1;
    clientSeqRef.current[qId] = currentSeq;

    setSaveStatus('saving');

    // Debounce save to backend
    quizService.saveAnswer(attemptId, qId, {
      ...newAnswer,
      clientSequence: currentSeq,
    })
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('error'));
  };

  const toggleFlag = (qId) => {
    const isFlagged = !answers[qId]?.isFlagged;
    handleAnswerChange(qId, { isFlagged });
  };

  const handleManualSubmit = async () => {
    try {
      await quizService.submitAttempt(attemptId);
      alert('Assessment submitted successfully!');
      navigate(`/student/classrooms/${classId}/quizzes/${quizId}/result/${attemptId}`);
    } catch (err) {
      alert(err.message || 'Failed to submit attempt');
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await quizService.submitAttempt(attemptId);
      alert('Time limit reached. Assessment has been automatically submitted.');
      navigate(`/student/classrooms/${classId}/quizzes/${quizId}/result/${attemptId}`);
    } catch (_) {}
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading secure test interface...</p>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter(
    (a) => (a.selectedOptionIds && a.selectedOptionIds.length > 0) || a.textAnswer?.trim() || a.booleanAnswer !== null
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      {/* Top Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 p-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Timed Attempt #{attempt?.attemptNumber}</span>
          </div>

          {/* Center Timer */}
          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
            <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className={`text-base font-extrabold font-mono ${remainingSeconds < 300 ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
              {formatTimer(remainingSeconds)}
            </span>
          </div>

          {/* Right Status */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-400">
              Autosave: <span className="font-semibold text-emerald-400">{saveStatus === 'saved' ? 'Saved' : 'Saving...'}</span>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" /> Submit Assessment
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Left: Question Drawer / Palette */}
        <aside className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase">Question Palette</span>
            <span className="text-xs font-semibold text-indigo-400">{answeredCount} / {questions.length} Answered</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const ans = answers[q._id];
              const isAns = (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) || ans?.textAnswer?.trim() || ans?.booleanAnswer !== null;
              const isFlag = ans?.isFlagged;
              const isCurr = idx === currentIndex;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-400';
              if (isCurr) btnStyle = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 border-transparent';
              else if (isFlag) btnStyle = 'bg-amber-950 border-amber-600 text-amber-300 font-bold';
              else if (isAns) btnStyle = 'bg-emerald-950 border-emerald-700 text-emerald-300 font-bold';

              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`p-2.5 text-xs rounded-xl border transition flex items-center justify-center relative ${btnStyle}`}
                >
                  {idx + 1}
                  {isFlag && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"></span>}
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-[10px] space-y-1.5 text-slate-400 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-700"></span> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-950 border border-amber-600"></span> Flagged for review
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-800"></span> Unanswered
            </div>
          </div>
        </aside>

        {/* Center/Right: Question Renderer */}
        <section className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-xl">
          {currentQ && (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length} • [{currentQ.type.replace('_', ' ')}] • {currentQ.marks} Marks
                  </span>
                  <h2 className="text-lg font-bold text-slate-100">{currentQ.promptSnapshot}</h2>
                </div>

                <button
                  onClick={() => toggleFlag(currentQ._id)}
                  className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                    answers[currentQ._id]?.isFlagged
                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flag className="w-4 h-4" /> {answers[currentQ._id]?.isFlagged ? 'Flagged' : 'Flag'}
                </button>
              </div>

              {/* Input Area by Question Type */}
              <div className="pt-2">
                {/* Single Choice */}
                {currentQ.type === 'single_choice' && currentQ.optionSnapshot && (
                  <div className="space-y-3">
                    {currentQ.optionSnapshot.map((opt) => (
                      <label
                        key={opt._id}
                        className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 text-sm transition ${
                          answers[currentQ._id]?.selectedOptionIds?.includes(opt._id)
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-semibold shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQ._id}`}
                          checked={answers[currentQ._id]?.selectedOptionIds?.includes(opt._id)}
                          onChange={() => handleAnswerChange(currentQ._id, { selectedOptionIds: [opt._id] })}
                          className="text-indigo-600 focus:ring-0"
                        />
                        <span><span className="font-bold mr-2">{opt.label}:</span>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Multiple Choice */}
                {currentQ.type === 'multiple_choice' && currentQ.optionSnapshot && (
                  <div className="space-y-3">
                    {currentQ.optionSnapshot.map((opt) => {
                      const selected = answers[currentQ._id]?.selectedOptionIds || [];
                      const isChecked = selected.includes(opt._id);
                      return (
                        <label
                          key={opt._id}
                          className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 text-sm transition ${
                            isChecked
                              ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-semibold shadow-lg'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newSel = e.target.checked
                                ? [...selected, opt._id]
                                : selected.filter((id) => id !== opt._id);
                              handleAnswerChange(currentQ._id, { selectedOptionIds: newSel });
                            }}
                            className="rounded text-indigo-600 focus:ring-0"
                          />
                          <span><span className="font-bold mr-2">{opt.label}:</span>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Short / Long Answer */}
                {(currentQ.type === 'short_answer' || currentQ.type === 'long_answer') && (
                  <div className="space-y-2">
                    <textarea
                      rows={currentQ.type === 'long_answer' ? 6 : 3}
                      value={answers[currentQ._id]?.textAnswer || ''}
                      onChange={(e) => handleAnswerChange(currentQ._id, { textAnswer: e.target.value })}
                      placeholder="Type your response here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Coding Question */}
                {currentQ.type === 'coding' && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Code Editor Workspace</span>
                      <span className="font-mono text-indigo-400">{currentQ.codingConfigSnapshot?.language || 'javascript'}</span>
                    </div>
                    <textarea
                      rows={10}
                      value={answers[currentQ._id]?.codeAnswer || ''}
                      onChange={(e) => handleAnswerChange(currentQ._id, { codeAnswer: e.target.value })}
                      className="w-full bg-slate-950 font-mono border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-100">Submit Assessment?</h3>
            <p className="text-xs text-slate-400">
              You are about to finalize and submit your assessment answers. Once submitted, your answers cannot be modified.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Answered Questions:</span>
                <span className="font-bold text-emerald-400">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unanswered Questions:</span>
                <span className="font-bold text-amber-400">{questions.length - answeredCount}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Return to Test
              </button>
              <button
                onClick={handleManualSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg"
              >
                Confirm Final Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
