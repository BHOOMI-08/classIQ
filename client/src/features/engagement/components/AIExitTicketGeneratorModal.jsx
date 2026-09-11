import React, { useState } from 'react';

export default function AIExitTicketGeneratorModal({ isOpen, onClose, onGenerate }) {
  const [topic, setTopic] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [questionCount, setQuestionCount] = useState(3);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      await onGenerate?.({
        topic,
        learningObjective,
        questionCount: parseInt(questionCount, 10),
        difficulty,
      });
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>✨</span>
            <span>AI Exit Ticket Generator</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <p className="text-xs text-slate-400">Uses Module 4 classroom document RAG embeddings to generate grounded exit tickets.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Topic</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Wave Optics & Interference"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Learning Objective</label>
            <input
              type="text"
              value={learningObjective}
              onChange={(e) => setLearningObjective(e.target.value)}
              placeholder="e.g. Verify understanding of Young double slit experiment"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Questions</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value={2}>2 Questions</option>
                <option value={3}>3 Questions</option>
                <option value={4}>4 Questions</option>
                <option value={5}>5 Questions</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? 'Generating Draft...' : '✨ Generate Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
