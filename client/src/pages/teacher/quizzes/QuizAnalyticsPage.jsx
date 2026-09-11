import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, TrendingUp, HelpCircle, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import quizService from '../../../services/quiz.service';

export default function QuizAnalyticsPage() {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [questionAnalytics, setQuestionAnalytics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [quizId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aRes, qRes] = await Promise.all([
        quizService.getQuizAnalytics(quizId),
        quizService.getQuestionAnalytics(quizId),
      ]);
      setAnalytics(aRes.data);
      setQuestionAnalytics(qRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load quiz analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await quizService.exportResultsCSV(quizId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quiz_${quizId}_analytics.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Computing analytics snapshots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
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
                <BarChart2 className="w-6 h-6 text-sky-400" /> Quiz Analytics & Misconception Insights
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Item-level discrimination index, topic accuracy, and score distribution</p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Export Analytics CSV
          </button>
        </div>

        {error ? (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : (
          <>
            {/* Top Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1">
                <div className="text-xs text-slate-400">Class Average Score</div>
                <div className="text-2xl font-bold text-indigo-400">{analytics?.averageScore?.toFixed(1) || 0}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1">
                <div className="text-xs text-slate-400">Pass Rate</div>
                <div className="text-2xl font-bold text-emerald-400">{analytics?.passRate?.toFixed(1) || 0}%</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1">
                <div className="text-xs text-slate-400">Total Completed</div>
                <div className="text-2xl font-bold text-slate-100">{analytics?.completedCount || 0}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1">
                <div className="text-xs text-slate-400">Median Score</div>
                <div className="text-2xl font-bold text-purple-400">{analytics?.medianScore?.toFixed(1) || 0}</div>
              </div>
            </div>

            {/* Question Level Discrimination & Misconception Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
              <h3 className="text-base font-bold text-slate-200">Question Item Analysis & Misconception Radar</h3>

              {questionAnalytics.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No question-level analytics snapshots computed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Topic</th>
                        <th className="p-3">Total Responses</th>
                        <th className="p-3">Correct</th>
                        <th className="p-3">Incorrect</th>
                        <th className="p-3">Accuracy %</th>
                        <th className="p-3">Discrimination Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {questionAnalytics.map((qItem, idx) => (
                        <tr key={qItem._id || idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-medium text-slate-100">{qItem.topic || 'General'}</td>
                          <td className="p-3">{qItem.totalResponses}</td>
                          <td className="p-3 text-emerald-400 font-semibold">{qItem.correctResponses}</td>
                          <td className="p-3 text-red-400 font-semibold">{qItem.incorrectResponses}</td>
                          <td className="p-3 font-bold">{qItem.accuracyPercentage?.toFixed(1)}%</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              (qItem.discriminationIndex || 0) >= 0.3
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-amber-950 text-amber-300'
                            }`}>
                              {qItem.discriminationIndex ? qItem.discriminationIndex.toFixed(2) : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
