import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Play, Plus, Trash2, HelpCircle, CheckCircle,
  Clock, Shield, Settings, Code, FileText, Sparkles, Layers, ListOrdered
} from 'lucide-react';
import quizService from '../../../services/quiz.service';

export default function QuizBuilderPage() {
  const { classId, quizId } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(quizId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // settings | questions

  // Quiz State
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    instructions: ['Read all questions carefully.', 'Calculators are allowed unless specified.'],
    topic: '',
    unit: '',
    quizType: 'graded',
    difficulty: 'medium',
    durationMinutes: 30,
    totalMarks: 10,
    passingMarks: 5,
    attemptLimit: 1,
    openingAt: new Date().toISOString().slice(0, 16),
    closingAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    randomizeQuestions: false,
    randomizeOptions: false,
    questionSelectionMode: 'fixed',
    resultReleaseMode: 'immediate',
    answerReviewPolicy: 'score_only',
    negativeMarkingEnabled: false,
    defaultNegativeMarks: 0,
    partialMarkingEnabled: false,
    requireFullscreen: false,
    tabSwitchMonitoringEnabled: false,
  });

  const [questions, setQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // New Question Form
  const [qForm, setQForm] = useState({
    type: 'single_choice',
    prompt: '',
    topic: '',
    difficulty: 'medium',
    marks: 2,
    negativeMarks: 0,
    explanation: '',
    options: [
      { label: 'A', text: '', isCorrect: true, misconceptionTag: '' },
      { label: 'B', text: '', isCorrect: false, misconceptionTag: '' },
    ],
    acceptedAnswers: [''],
    answerMatchingMode: 'normalized',
    codingConfig: {
      language: 'javascript',
      starterCode: '// Write your code here',
      testCases: [{ input: '1, 2', output: '3', isPublic: true }],
    },
  });

  useEffect(() => {
    if (isEditing) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const qRes = await quizService.getQuiz(quizId);
      const qData = qRes.data;
      setQuizForm({
        ...qData,
        openingAt: qData.openingAt ? new Date(qData.openingAt).toISOString().slice(0, 16) : '',
        closingAt: qData.closingAt ? new Date(qData.closingAt).toISOString().slice(0, 16) : '',
      });

      const qListRes = await quizService.getQuizQuestions(quizId);
      setQuestions(qListRes.data || []);
    } catch (err) {
      alert(err.message || 'Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuizSettings = async () => {
    setSaving(true);
    try {
      if (isEditing) {
        await quizService.updateQuiz(quizId, quizForm);
        alert('Quiz settings saved successfully');
      } else {
        const res = await quizService.createQuiz(classId, quizForm);
        alert('Draft quiz created! Now you can add questions.');
        navigate(`/teacher/classrooms/${classId}/quizzes/${res.data._id}/edit`);
      }
    } catch (err) {
      alert(err.message || 'Failed to save quiz settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!qForm.prompt.trim()) return alert('Prompt is required');
    if (!quizId) return alert('Please save quiz settings first');

    try {
      await quizService.createQuestion(quizId, qForm);
      setShowQuestionModal(false);
      // Reload questions & quiz marks
      loadQuiz();
      // Reset QForm
      setQForm({
        type: 'single_choice',
        prompt: '',
        topic: '',
        difficulty: 'medium',
        marks: 2,
        negativeMarks: 0,
        explanation: '',
        options: [
          { label: 'A', text: '', isCorrect: true, misconceptionTag: '' },
          { label: 'B', text: '', isCorrect: false, misconceptionTag: '' },
        ],
        acceptedAnswers: [''],
        answerMatchingMode: 'normalized',
        codingConfig: {
          language: 'javascript',
          starterCode: '// Write your code here',
          testCases: [{ input: '', output: '', isPublic: true }],
        },
      });
    } catch (err) {
      alert(err.message || 'Failed to add question');
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Publish this quiz to students now?')) return;
    try {
      await quizService.publishQuiz(quizId);
      alert('Quiz published successfully!');
      navigate(`/teacher/classrooms/${classId}/quizzes`);
    } catch (err) {
      alert(err.message || 'Failed to publish quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading quiz editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes`)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100">
                {isEditing ? `Edit: ${quizForm.title || 'Untitled Quiz'}` : 'Create New Manual Quiz'}
              </h1>
              <p className="text-xs text-slate-400">Configure questions, timers, randomization, and release rules</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveQuizSettings}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            {isEditing && (
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4" /> Publish Quiz
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Quiz Settings & Rules
          </button>
          <button
            onClick={() => {
              if (!isEditing) return alert('Please save settings first to add questions.');
              setActiveTab('questions');
            }}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'questions'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Questions & Answer Keys ({questions.length})
          </button>
        </div>

        {/* TAB 1: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Basic Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Quiz Title *</label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      placeholder="e.g. Data Structures Midterm Examination"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={quizForm.description}
                      onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                      placeholder="Overview of scope, chapters covered, and guidelines..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Topic</label>
                      <input
                        type="text"
                        value={quizForm.topic}
                        onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                        placeholder="e.g. Binary Trees"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Unit / Module</label>
                      <input
                        type="text"
                        value={quizForm.unit}
                        onChange={(e) => setQuizForm({ ...quizForm, unit: e.target.value })}
                        placeholder="e.g. Unit 3"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Quiz Type</label>
                      <select
                        value={quizForm.quizType}
                        onChange={(e) => setQuizForm({ ...quizForm, quizType: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="graded">Graded Assessment</option>
                        <option value="practice">Practice Quiz</option>
                        <option value="diagnostic">Diagnostic Assessment</option>
                        <option value="revision">Revision Test</option>
                        <option value="mock_exam">Mock Exam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Difficulty Level</label>
                      <select
                        value={quizForm.difficulty}
                        onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing & Scoring Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" /> Timing & Scoring Rules
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Minutes) *</label>
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={quizForm.durationMinutes}
                      onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: parseInt(e.target.value) || 30 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Total Marks</label>
                    <input
                      type="number"
                      min={1}
                      value={quizForm.totalMarks}
                      onChange={(e) => setQuizForm({ ...quizForm, totalMarks: parseInt(e.target.value) || 10 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Passing Marks</label>
                    <input
                      type="number"
                      min={0}
                      value={quizForm.passingMarks}
                      onChange={(e) => setQuizForm({ ...quizForm, passingMarks: parseInt(e.target.value) || 5 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Opening Date & Time</label>
                    <input
                      type="datetime-local"
                      value={quizForm.openingAt}
                      onChange={(e) => setQuizForm({ ...quizForm, openingAt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Closing Date & Time</label>
                    <input
                      type="datetime-local"
                      value={quizForm.closingAt}
                      onChange={(e) => setQuizForm({ ...quizForm, closingAt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Policies & Anti-Cheating */}
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" /> Assessment Policies
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Attempt Limit</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={quizForm.attemptLimit}
                      onChange={(e) => setQuizForm({ ...quizForm, attemptLimit: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Result Release Mode</label>
                    <select
                      value={quizForm.resultReleaseMode}
                      onChange={(e) => setQuizForm({ ...quizForm, resultReleaseMode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100"
                    >
                      <option value="immediate">Immediate after submission</option>
                      <option value="after_submission_window">After closing window</option>
                      <option value="after_manual_review">After manual review</option>
                      <option value="teacher_release">Explicit teacher release</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Answer Review Policy</label>
                    <select
                      value={quizForm.answerReviewPolicy}
                      onChange={(e) => setQuizForm({ ...quizForm, answerReviewPolicy: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100"
                    >
                      <option value="no_review">No Review</option>
                      <option value="score_only">Score Only</option>
                      <option value="explanations_only">Explanations Only</option>
                      <option value="answers_and_explanations">Answers & Explanations</option>
                      <option value="full_review">Full Review</option>
                    </select>
                  </div>

                  <div className="pt-2 space-y-2 border-t border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quizForm.randomizeQuestions}
                        onChange={(e) => setQuizForm({ ...quizForm, randomizeQuestions: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-300">Randomize question order per student</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quizForm.randomizeOptions}
                        onChange={(e) => setQuizForm({ ...quizForm, randomizeOptions: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-300">Randomize options order per question</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quizForm.negativeMarkingEnabled}
                        onChange={(e) => setQuizForm({ ...quizForm, negativeMarkingEnabled: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-300">Enable negative marking</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quizForm.tabSwitchMonitoringEnabled}
                        onChange={(e) => setQuizForm({ ...quizForm, tabSwitchMonitoringEnabled: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-300">Track tab switch & focus events</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUESTIONS */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-200">Questions ({questions.length})</h3>
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="py-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm">No questions added to this quiz yet.</p>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
                >
                  Add First Question
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q._id || idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-indigo-400 uppercase">
                          Q{idx + 1} • {q.type.replace('_', ' ')} • {q.marks} Marks
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100">{q.prompt}</h4>
                      </div>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border ${
                              opt.isCorrect
                                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 font-medium'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-1">{opt.label || String.fromCharCode(65 + oIdx)}:</span> {opt.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD QUESTION */}
        {showQuestionModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-100">Add New Question</h3>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Question Type</label>
                    <select
                      value={qForm.type}
                      onChange={(e) => setQForm({ ...qForm, type: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    >
                      <option value="single_choice">Single Choice (MCQ)</option>
                      <option value="multiple_choice">Multiple Choice (Multi-Select)</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="long_answer">Long Answer</option>
                      <option value="coding">Coding Question</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Marks</label>
                    <input
                      type="number"
                      min={1}
                      value={qForm.marks}
                      onChange={(e) => setQForm({ ...qForm, marks: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Negative Marks</label>
                    <input
                      type="number"
                      min={0}
                      value={qForm.negativeMarks}
                      onChange={(e) => setQForm({ ...qForm, negativeMarks: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Question Prompt *</label>
                  <textarea
                    rows={3}
                    value={qForm.prompt}
                    onChange={(e) => setQForm({ ...qForm, prompt: e.target.value })}
                    placeholder="Enter the question text..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  />
                </div>

                {/* Option Editor for Single/Multiple Choice */}
                {(qForm.type === 'single_choice' || qForm.type === 'multiple_choice') && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block font-semibold text-slate-300">Options</label>
                    {qForm.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type={qForm.type === 'single_choice' ? 'radio' : 'checkbox'}
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            const newOpts = [...qForm.options];
                            if (qForm.type === 'single_choice') {
                              newOpts.forEach((o, i) => { o.isCorrect = i === idx; });
                            } else {
                              newOpts[idx].isCorrect = e.target.checked;
                            }
                            setQForm({ ...qForm, options: newOpts });
                          }}
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...qForm.options];
                            newOpts[idx].text = e.target.value;
                            setQForm({ ...qForm, options: newOpts });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setQForm({
                        ...qForm,
                        options: [...qForm.options, { label: String.fromCharCode(65 + qForm.options.length), text: '', isCorrect: false, misconceptionTag: '' }]
                      })}
                      className="text-indigo-400 font-semibold hover:underline"
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                {/* Short Answer Editor */}
                {qForm.type === 'short_answer' && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block font-semibold text-slate-300">Accepted Answers (Comma separated)</label>
                    <input
                      type="text"
                      value={qForm.acceptedAnswers.join(', ')}
                      onChange={(e) => setQForm({ ...qForm, acceptedAnswers: e.target.value.split(',').map((s) => s.trim()) })}
                      placeholder="e.g. malloc, calloc, realloc"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Teacher Explanation / Feedback</label>
                  <input
                    type="text"
                    value={qForm.explanation}
                    onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                    placeholder="Explanation shown to students post release..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg"
                  >
                    Save Question
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
