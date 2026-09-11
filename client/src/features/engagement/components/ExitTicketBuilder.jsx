import React, { useState } from 'react';

export default function ExitTicketBuilder({ onCreateTicket, onOpenAIGenerator }) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [questions, setQuestions] = useState([
    {
      type: 'single_choice',
      prompt: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { type: 'single_choice', prompt: '', options: ['', '', '', ''], correctAnswer: '' },
    ]);
  };

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || questions.some((q) => !q.prompt.trim())) return;
    setLoading(true);
    try {
      await onCreateTicket?.({
        title,
        topic,
        durationMinutes: parseInt(durationMinutes, 10),
        questions,
      });
      setTitle('');
      setTopic('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Create Exit Ticket</h2>
          <p className="text-xs text-slate-400">Assess lecture understanding before students leave</p>
        </div>
        <button
          type="button"
          onClick={onOpenAIGenerator}
          className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs hover:bg-indigo-600/30 transition-all flex items-center space-x-1.5"
        >
          <span>✨</span>
          <span>Generate with AI (Module 4 RAG)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Ticket Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics 101 Lecture Exit Ticket"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Wave Optics"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Duration (Minutes)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">Questions ({questions.length})</label>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase">Question #{qIdx + 1}</span>
                <select
                  value={q.type}
                  onChange={(e) => handleQuestionChange(qIdx, 'type', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="single_choice">Single Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="confidence_scale">Confidence Scale (1-5)</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>

              <input
                type="text"
                required
                value={q.prompt}
                onChange={(e) => handleQuestionChange(qIdx, 'prompt', e.target.value)}
                placeholder="Question prompt..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />

              {q.type === 'single_choice' && (
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((optText, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      value={optText}
                      onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                      placeholder={`Option ${oIdx + 1}`}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {questions.length < 5 && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              + Add Question
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all disabled:opacity-50"
        >
          {loading ? 'Creating Exit Ticket...' : 'Save & Launch Exit Ticket'}
        </button>
      </form>
    </div>
  );
}
