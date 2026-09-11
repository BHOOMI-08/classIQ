import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Layers, CheckCircle2, AlertCircle, RefreshCw, Save } from 'lucide-react';
import quizService from '../../../services/quiz.service';
import contentResourceService from '../../../services/contentResourceService';

export default function QuizAIGeneratorPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState('rag'); // 'rag' | 'topic'
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState([]);
  const [error, setError] = useState(null);

  const [generationForm, setGenerationForm] = useState({
    topic: 'Binary Search Trees & Heap Sorting',
    unit: 'Unit 4: Advanced Data Structures',
    difficulty: 'medium',
    totalQuestions: 5,
    totalMarks: 20,
    durationMinutes: 30,
    questionTypes: ['single_choice', 'short_answer', 'true_false'],
  });

  const [generatedArtifact, setGeneratedArtifact] = useState(null);

  useEffect(() => {
    fetchResources();
  }, [classId]);

  const fetchResources = async () => {
    try {
      const res = await contentResourceService.getClassroomResources(classId);
      setResources(res.data || []);
    } catch (_) {
      setResources([]);
    }
  };

  const toggleResource = (id) => {
    if (selectedResourceIds.includes(id)) {
      setSelectedResourceIds(selectedResourceIds.filter((rId) => rId !== id));
    } else {
      setSelectedResourceIds([...selectedResourceIds, id]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        generationMode: mode === 'rag' ? 'resource_rag' : 'topic',
        sourceResourceIds: selectedResourceIds,
        ...generationForm,
      };
      const res = await quizService.generateQuizAI(classId, payload);
      setGeneratedArtifact(res.data);
    } catch (err) {
      setError(err.message || 'AI Question Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!generatedArtifact || !generatedArtifact.structuredOutput) return;
    setLoading(true);
    try {
      const quizData = generatedArtifact.structuredOutput;
      const createRes = await quizService.createQuiz(classId, {
        title: quizData.title || `AI Generated: ${generationForm.topic}`,
        instructions: quizData.instructions || ['Answer all AI generated questions carefully.'],
        topic: generationForm.topic,
        unit: generationForm.unit,
        durationMinutes: generationForm.durationMinutes,
        totalMarks: generationForm.totalMarks,
        quizType: 'graded',
        difficulty: generationForm.difficulty,
        aiGenerated: true,
      });

      const newQuizId = createRes.data._id;

      // Add generated questions
      if (Array.isArray(quizData.questions)) {
        for (const q of quizData.questions) {
          await quizService.createQuestion(newQuizId, q);
        }
      }

      alert('AI Quiz saved as draft successfully!');
      navigate(`/teacher/classrooms/${classId}/quizzes/${newQuizId}/edit`);
    } catch (err) {
      alert(err.message || 'Failed to save generated quiz as draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/teacher/classrooms/${classId}/quizzes`)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" /> AI Quiz Generator (Gemini + RAG)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate grounded assessments using course PDFs/notes or topic parameters
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('rag')}
            className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
              mode === 'rag'
                ? 'bg-purple-950/40 border-purple-600/60 shadow-lg text-purple-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <BookOpen className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-sm font-bold">RAG-Grounded Content Generation</div>
              <div className="text-xs opacity-75">Ground questions directly on Module 4 uploaded PDFs & Notes</div>
            </div>
          </button>

          <button
            onClick={() => setMode('topic')}
            className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
              mode === 'topic'
                ? 'bg-indigo-950/40 border-indigo-600/60 shadow-lg text-indigo-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Layers className="w-6 h-6 text-indigo-400" />
            <div>
              <div className="text-sm font-bold">Topic & Bloom-Level Generator</div>
              <div className="text-xs opacity-75">Generate questions based on topic curriculum & difficulty targets</div>
            </div>
          </button>
        </div>

        {/* Generation Form */}
        <form onSubmit={handleGenerate} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          {mode === 'rag' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Select Course Documents / PDFs for RAG Grounding:
              </label>
              {resources.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No Module 4 course resources found in this classroom.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                  {resources.map((res) => (
                    <div
                      key={res._id}
                      onClick={() => toggleResource(res._id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition ${
                        selectedResourceIds.includes(res._id)
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-medium'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="line-clamp-1">{res.title}</span>
                      {selectedResourceIds.includes(res._id) && <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Target Topic</label>
              <input
                type="text"
                value={generationForm.topic}
                onChange={(e) => setGenerationForm({ ...generationForm, topic: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Unit / Chapter</label>
              <input
                type="text"
                value={generationForm.unit}
                onChange={(e) => setGenerationForm({ ...generationForm, unit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Number of Questions</label>
              <input
                type="number"
                min={1}
                max={25}
                value={generationForm.totalQuestions}
                onChange={(e) => setGenerationForm({ ...generationForm, totalQuestions: parseInt(e.target.value) || 5 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Total Marks</label>
              <input
                type="number"
                min={1}
                value={generationForm.totalMarks}
                onChange={(e) => setGenerationForm({ ...generationForm, totalMarks: parseInt(e.target.value) || 20 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Difficulty Level</label>
              <select
                value={generationForm.difficulty}
                onChange={(e) => setGenerationForm({ ...generationForm, difficulty: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-950/40 border border-purple-400/30 flex items-center gap-2 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generating Questions with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Structured Quiz
                </>
              )}
            </button>
          </div>
        </form>

        {/* Generated Preview Artifact */}
        {generatedArtifact && generatedArtifact.structuredOutput && (
          <div className="bg-slate-900/90 border border-purple-800/60 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">AI Artifact Ready</span>
                <h3 className="text-xl font-bold text-slate-100">{generatedArtifact.structuredOutput.title}</h3>
              </div>
              <button
                onClick={handleSaveAsDraft}
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" /> Save as Editable Quiz Draft
              </button>
            </div>

            <div className="space-y-4">
              {generatedArtifact.structuredOutput.questions?.map((q, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300">
                      Q{idx + 1}. [{q.type}] • {q.marks} Marks
                    </span>
                    <span className="text-slate-500 capitalize">{q.difficulty}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">{q.prompt}</p>

                  {q.options && (
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border ${
                            opt.isCorrect ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300 font-medium' : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800/60">
                      Explanation: {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
