import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle, XCircle, Sparkles, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import quizService from '../../../services/quiz.service';

export default function QuizResultPage() {
  const { classId, quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);
  const [aiExplanations, setAiExplanations] = useState({}); // { scoreId: explanationObj }
  const [loadingExplanationId, setLoadingExplanationId] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await quizService.getStudentResult(attemptId);
      setResultData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExplanation = async (scoreId) => {
    setLoadingExplanationId(scoreId);
    try {
      const res = await quizService.getExplanation(scoreId);
      setAiExplanations((prev) => ({ ...prev, [scoreId]: res.data }));
    } catch (err) {
      alert(err.message || 'Failed to generate AI explanation');
    } finally {
      setLoadingExplanationId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading assessment receipt & scores...</p>
        </div>
      </div>
    );
  }

  const { result, scores = [], topicPerformances = [], attempt } = resultData || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(`/student/classrooms/${classId}/quizzes`)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>

        {error ? (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
            {error}
          </div>
        ) : (
          <>
            {/* Main Score Header Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Submission Receipt: {attempt?.submissionReceiptCode}
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-100">Assessment Result Summary</h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-2xl text-xs font-bold border ${
                    result?.passed
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      : 'bg-red-950/80 text-red-300 border-red-700/60'
                  }`}>
                    {result?.passed ? 'PASSED' : 'NEEDS REVISION'}
                  </div>
                </div>
              </div>

              {/* Big Score Counter */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-500 font-semibold">Final Marks</div>
                  <div className="text-3xl font-extrabold text-indigo-400">{result?.finalMarks} <span className="text-sm font-normal text-slate-500">/ {result?.totalMarks}</span></div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-500 font-semibold">Percentage</div>
                  <div className="text-3xl font-extrabold text-sky-400">{result?.percentage?.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-500 font-semibold">Grade</div>
                  <div className="text-3xl font-extrabold text-purple-400">{result?.gradeLabel || 'N/A'}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-500 font-semibold">Correct Answers</div>
                  <div className="text-3xl font-extrabold text-emerald-400">{result?.correctCount}</div>
                </div>
              </div>
            </div>

            {/* Topic Mastery Cards */}
            {topicPerformances.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-200">Topic Proficiency Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topicPerformances.map((tp) => (
                    <div key={tp._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{tp.topic || 'General'}</div>
                        <div className="text-slate-400">{tp.correctQuestions} / {tp.totalQuestions} Questions Correct</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                        tp.proficiencyLabel === 'strong' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        tp.proficiencyLabel === 'developing' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {tp.proficiencyLabel?.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question Scores & Explanations */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-200">Question-by-Question Breakdown</h3>

              <div className="space-y-4">
                {scores.map((s, idx) => (
                  <div key={s._id || idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Q{idx + 1}. {s.topic ? `[${s.topic}]` : ''}</span>
                      <span className={`font-bold ${s.marksAwarded > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.marksAwarded} / {s.marksAvailable} Marks
                      </span>
                    </div>

                    <div className="text-slate-400">
                      Correctness Status: <span className="font-semibold capitalize text-slate-200">{s.correctness?.replace('_', ' ')}</span>
                    </div>

                    {s.reviewerFeedback && (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg text-indigo-300">
                        Teacher Feedback: {s.reviewerFeedback}
                      </div>
                    )}

                    {/* AI Explanation trigger */}
                    <div className="pt-2">
                      {aiExplanations[s._id] ? (
                        <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-xl text-purple-200 space-y-2">
                          <div className="font-bold flex items-center gap-1 text-purple-300">
                            <Sparkles className="w-3.5 h-3.5" /> AI Explanation (Gemini Grounded)
                          </div>
                          <p>{aiExplanations[s._id].explanation || aiExplanations[s._id].whyCorrect}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleFetchExplanation(s._id)}
                          disabled={loadingExplanationId === s._id}
                          className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 rounded-lg border border-purple-700/50 flex items-center gap-1.5 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          {loadingExplanationId === s._id ? 'Generating Explanation...' : 'Get AI Explanation'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
