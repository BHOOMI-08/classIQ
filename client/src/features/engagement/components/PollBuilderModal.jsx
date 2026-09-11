import React, { useState } from 'react';

export default function PollBuilderModal({ isOpen, onClose, onCreatePoll }) {
  const [question, setQuestion] = useState('');
  const [type, setType] = useState('single_choice');
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ]);
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleOptionChange = (idx, text) => {
    const updated = [...options];
    updated[idx].text = text;
    setOptions(updated);
  };

  const handleCorrectChange = (idx) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === idx,
    }));
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || options.some((o) => !o.text.trim())) return;
    setLoading(true);
    try {
      await onCreatePoll?.({
        question,
        type,
        topic,
        options,
        durationMinutes: parseInt(durationMinutes, 10),
      });
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold text-slate-100">Create Live Poll</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Poll Question</label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the SI unit of force?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Poll Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
              >
                <option value="single_choice">Single Choice (MCQ)</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True / False</option>
                <option value="concept_check">Concept Check</option>
                <option value="opinion">Opinion Poll</option>
                <option value="prediction">Prediction Poll</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Newton Laws"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Options</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="correctOption"
                  checked={opt.isCorrect}
                  onChange={() => handleCorrectChange(idx)}
                  className="accent-indigo-500"
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  required
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            ))}

            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                + Add Option
              </button>
            )}
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Poll Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
