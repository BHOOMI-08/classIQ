import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Sparkles, Clock, AlertCircle, CheckCircle,
  Play, Pause, Archive, XCircle, BarChart2, Eye, Award, Download, Users, RefreshCw
} from 'lucide-react';
import quizService from '../../../services/quiz.service';

export default function TeacherQuizListPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [classId]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await quizService.getClassroomQuizzes(classId);
      setQuizzes(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (quizId) => {
    if (!window.confirm('Are you sure you want to publish this quiz? Eligible students will be able to attempt it according to the schedule.')) return;
    setActionLoading(quizId);
    try {
      await quizService.publishQuiz(quizId);
      await fetchQuizzes();
    } catch (err) {
      alert(err.message || 'Failed to publish quiz');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (quizId) => {
    setActionLoading(quizId);
    try {
      const res = await quizService.duplicateQuiz(quizId);
      alert('Quiz duplicated as draft successfully');
      navigate(`/teacher/classrooms/${classId}/quizzes/${res.data._id}/edit`);
    } catch (err) {
      alert(err.message || 'Failed to duplicate quiz');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (quizId) => {
    if (!window.confirm('Archive this quiz? It will be hidden from main views.')) return;
    setActionLoading(quizId);
    try {
      await quizService.archiveQuiz(quizId);
      await fetchQuizzes();
    } catch (err) {
      alert(err.message || 'Failed to archive quiz');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async (quizId, title) => {
    try {
      const blob = await quizService.exportResultsCSV(quizId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_results.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Exporting results CSV failed: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesFilter = filterStatus === 'all' || q.status === filterStatus;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">Draft</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">Scheduled</span>;
      case 'published':
      case 'active':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Active</span>;
      case 'closed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50">Closed</span>;
      case 'archived':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-900 text-slate-500 border border-slate-800">Archived</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-200 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
                  Quiz & Assessment Management
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Create, publish, monitor, grade, and analyze assessments for your classroom
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes/ai-generator`)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-purple-950/40 border border-purple-400/30 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              AI Quiz Generator
            </button>
            <button
              onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes/create`)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-950/40 border border-indigo-400/30 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              New Manual Quiz
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {['all', 'draft', 'published', 'active', 'closed', 'archived'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={fetchQuizzes}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Refresh Quizzes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm text-slate-400">Loading quizzes...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 space-y-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">No quizzes found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Get started by creating a new quiz manually or generating one using RAG AI grounded on your classroom content.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes/create`)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
              >
                Create Manual Quiz
              </button>
              <button
                onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes/ai-generator`)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition"
              >
                Generate with AI
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg group relative"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                        {quiz.quizType || 'graded'} • {quiz.difficulty || 'medium'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1">
                        {quiz.title}
                      </h3>
                    </div>
                    {getStatusBadge(quiz.status)}
                  </div>

                  {quiz.topic && (
                    <div className="inline-block px-2.5 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-md">
                      Topic: {quiz.topic}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {quiz.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-500">Duration</div>
                      <div className="text-sm font-semibold text-slate-200 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {quiz.durationMinutes}m
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-500">Questions</div>
                      <div className="text-sm font-semibold text-slate-200">
                        {quiz.totalQuestions || 0}
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-500">Total Marks</div>
                      <div className="text-sm font-semibold text-indigo-400">
                        {quiz.totalMarks || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {quiz.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(quiz._id)}
                        disabled={actionLoading === quiz._id}
                        className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                      >
                        <Play className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    {(quiz.status === 'published' || quiz.status === 'active') && (
                      <button
                        onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes/${quiz._id}/monitor`)}
                        className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                      >
                        <Users className="w-3.5 h-3.5" /> Live Monitor
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes/${quiz._id}/analytics`)}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-sky-400" /> Analytics
                    </button>

                    <button
                      onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes/${quiz._id}/review`)}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" /> Review & Grade
                    </button>

                    <button
                      onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes/${quiz._id}/edit`)}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      Edit Quiz
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleDuplicate(quiz._id)}
                      className="hover:text-slate-300 transition"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleExport(quiz._id, quiz.title)}
                      className="hover:text-slate-300 flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" /> Export CSV
                    </button>
                    {quiz.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(quiz._id)}
                        className="hover:text-red-400 transition"
                      >
                        Archive
                      </button>
                    )}
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
