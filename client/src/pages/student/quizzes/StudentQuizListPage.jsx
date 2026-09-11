import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Clock, Play, CheckCircle, AlertCircle, Award, RefreshCw, ChevronRight } from 'lucide-react';
import quizService from '../../../services/quiz.service';

export default function StudentQuizListPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(err.message || 'Failed to load available quizzes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-200 to-sky-300 bg-clip-text text-transparent">
                Available Assessments & Quizzes
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Attempt timed tests, review past attempts, and track topic mastery</p>
            </div>
          </div>

          <button
            onClick={fetchQuizzes}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm text-slate-400">Loading quizzes...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">No active or published quizzes</h3>
            <p className="text-xs text-slate-500">Your teacher has not published any quizzes in this classroom yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                      {quiz.quizType || 'graded'} • {quiz.difficulty || 'medium'}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Available
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {quiz.description || 'Complete the assessment before the closing deadline.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500">Time Limit</div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" /> {quiz.durationMinutes} mins
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500">Total Marks</div>
                      <div className="text-xs font-semibold text-indigo-400">{quiz.totalMarks} Marks</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => navigate(`/student/classrooms/${classId}/quizzes/${quiz._id}/instructions`)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-1.5 transition"
                  >
                    Start Assessment <ChevronRight className="w-4 h-4" />
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
