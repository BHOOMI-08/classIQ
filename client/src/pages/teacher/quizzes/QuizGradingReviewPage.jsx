import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle, Save, AlertCircle, RefreshCw, User } from 'lucide-react';
import quizService from '../../../services/quiz.service';

export default function QuizGradingReviewPage() {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pendingScores, setPendingScores] = useState([]);
  const [error, setError] = useState(null);
  const [submittingScoreId, setSubmittingScoreId] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    marksAwarded: 0,
    reviewerFeedback: '',
  });

  useEffect(() => {
    fetchPendingReview();
  }, [quizId]);

  const fetchPendingReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await quizService.getPendingReview(quizId);
      setPendingScores(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (questionScoreId) => {
    setSubmittingScoreId(questionScoreId);
    try {
      await quizService.submitReview(questionScoreId, reviewForm);
      alert('Review score submitted successfully!');
      fetchPendingReview();
    } catch (err) {
      alert(err.message || 'Failed to submit score');
    } finally {
      setSubmittingScoreId(null);
    }
  };

  const handleReleaseAllResults = async () => {
    if (!window.confirm('Release all finalized quiz results to students?')) return;
    try {
      await quizService.releaseResults(quizId);
      alert('Results released to students successfully!');
    } catch (err) {
      alert(err.message || 'Failed to release results');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading subjective reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes`)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" /> Subjective Review & Manual Grading
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Review long answers, case responses, and coding submissions</p>
            </div>
          </div>

          <button
            onClick={handleReleaseAllResults}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow flex items-center gap-2 transition"
          >
            <CheckCircle className="w-4 h-4" /> Release Results To Students
          </button>
        </div>

        {error ? (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : pendingScores.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">All Pending Reviews Complete</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no pending subjective answers awaiting manual teacher review for this quiz.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingScores.map((scoreItem) => (
              <div key={scoreItem._id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                    <User className="w-4 h-4" /> Student Attempt ID: {scoreItem.attemptId}
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/80 rounded-full">
                    Pending Review
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Question Prompt ({scoreItem.marksAvailable} Marks)</span>
                  <p className="text-sm font-semibold text-slate-100">{scoreItem.attemptQuestionId?.promptSnapshot || 'Question text unavailable'}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Student Submitted Answer:</span>
                  <div className="text-sm text-slate-200 whitespace-pre-wrap font-mono">
                    {scoreItem.matchedAnswer || 'No textual response recorded.'}
                  </div>
                </div>

                {/* Score & Feedback Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">
                      Awarded Marks (Max: {scoreItem.marksAvailable})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={scoreItem.marksAvailable}
                      onChange={(e) => setReviewForm({ ...reviewForm, marksAwarded: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-400 mb-1">Teacher Feedback / Notes</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        onChange={(e) => setReviewForm({ ...reviewForm, reviewerFeedback: e.target.value })}
                        placeholder="Feedback explaining mark deductions or highlights..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                      />
                      <button
                        onClick={() => handleReviewSubmit(scoreItem._id)}
                        disabled={submittingScoreId === scoreItem._id}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1 transition"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Score
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
