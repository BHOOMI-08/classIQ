import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, AlertTriangle, Play, ShieldAlert, CheckCircle, RefreshCw, Send } from 'lucide-react';
import quizService from '../../../services/quiz.service';
import { io } from 'socket.io-client';

export default function LiveQuizMonitorPage() {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultsList, setResultsList] = useState([]);
  const [liveAttempts, setLiveAttempts] = useState([]);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({
    studentId: '',
    extraAttempts: 1,
    extraDurationMinutes: 15,
    reason: 'Medical exception / Technical issue',
  });

  useEffect(() => {
    loadData();

    // Socket.IO Room setup for live teacher monitoring
    const socket = io('/', { path: '/socket.io', transports: ['websocket', 'polling'] });
    socket.emit('join_quiz_monitor', { quizId });

    socket.on('quiz:attempt_started', (data) => {
      setLiveAttempts((prev) => [...prev.filter((a) => a.studentId !== data.studentId), data]);
    });

    socket.on('quiz:attempt_updated', (data) => {
      setLiveAttempts((prev) => prev.map((a) => (a.attemptId === data.attemptId ? { ...a, ...data } : a)));
    });

    return () => {
      socket.disconnect();
    };
  }, [quizId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, rRes] = await Promise.all([
        quizService.getQuiz(quizId),
        quizService.getQuizResultsList(quizId),
      ]);
      setQuiz(qRes.data);
      setResultsList(rRes.data || []);
    } catch (err) {
      alert(err.message || 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrant = async (e) => {
    e.preventDefault();
    try {
      await quizService.createGrant(quizId, grantForm);
      alert('Student access grant issued successfully!');
      setShowGrantModal(false);
    } catch (err) {
      alert(err.message || 'Failed to grant access exception');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Initializing Live Quiz Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes`)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live Socket.IO Stream</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100">{quiz?.title} — Real-Time Monitor</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGrantModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow flex items-center gap-2 transition"
            >
              + Grant Student Exception
            </button>
            <button
              onClick={loadData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> Total Submitted Results
            </div>
            <div className="text-2xl font-bold text-slate-100">{resultsList.length}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" /> Active Session Duration
            </div>
            <div className="text-2xl font-bold text-slate-100">{quiz?.durationMinutes} mins</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Proctored Security Signal Monitoring
            </div>
            <div className="text-sm font-semibold text-slate-300">Active Focus Tracking</div>
          </div>
        </div>

        {/* Active Submissions & Results Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-200">Completed & Submitted Attempts ({resultsList.length})</h3>

          {resultsList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No completed student attempts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Student Name / ID</th>
                    <th className="p-3">Score / Total</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {resultsList.map((res) => (
                    <tr key={res._id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium text-slate-100">{res.studentId?.name || res.studentId}</td>
                      <td className="p-3 font-semibold text-indigo-400">{res.finalMarks} / {res.totalMarks}</td>
                      <td className="p-3">{res.percentage?.toFixed(1)}%</td>
                      <td className="p-3 font-bold">{res.gradeLabel}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          res.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                          {res.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(res.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: GRANT EXCEPTION */}
        {showGrantModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-100">Grant Individual Student Exception</h3>
              <form onSubmit={handleCreateGrant} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Student Mongo ID</label>
                  <input
                    type="text"
                    required
                    value={grantForm.studentId}
                    onChange={(e) => setGrantForm({ ...grantForm, studentId: e.target.value })}
                    placeholder="Enter Student User ID"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Extra Attempts</label>
                    <input
                      type="number"
                      min={1}
                      value={grantForm.extraAttempts}
                      onChange={(e) => setGrantForm({ ...grantForm, extraAttempts: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Extra Duration (Mins)</label>
                    <input
                      type="number"
                      min={0}
                      value={grantForm.extraDurationMinutes}
                      onChange={(e) => setGrantForm({ ...grantForm, extraDurationMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Reason / Justification</label>
                  <input
                    type="text"
                    value={grantForm.reason}
                    onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGrantModal(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-600 text-white font-semibold rounded-lg"
                  >
                    Issue Grant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
