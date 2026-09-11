import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exitTicketService } from '../../services/exitTicketService.js';

export default function ExitTicketAttemptPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await exitTicketService.getExitTicketById(ticketId);
        setTicketData(res.data);
      } catch (_) {}
    }
    loadTicket();
  }, [ticketId]);

  const handleAnswerChange = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        responseValue: String(val),
      }));

      const res = await exitTicketService.submitAttempt(ticketId, formattedAnswers);
      setResult(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  if (!ticketData) {
    return <div className="p-8 text-center text-slate-400">Loading exit ticket...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{ticketData.topic}</span>
          <h1 className="text-2xl font-extrabold text-slate-100">{ticketData.title}</h1>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {(ticketData.questions || []).map((q, idx) => (
              <div key={q._id} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Question #{idx + 1}</span>
                <h3 className="font-bold text-base text-slate-100">{q.prompt}</h3>

                {q.type === 'single_choice' && (
                  <div className="space-y-2 pt-2">
                    {(q.options || []).map((optText, oIdx) => (
                      <label key={oIdx} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-indigo-500">
                        <input
                          type="radio"
                          name={`q_${q._id}`}
                          value={optText}
                          checked={answers[q._id] === optText}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                          className="accent-indigo-500"
                        />
                        <span className="text-sm font-medium text-slate-200">{optText}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'true_false' && (
                  <div className="flex space-x-4 pt-2">
                    {['True', 'False'].map((tf) => (
                      <label key={tf} className="flex-1 flex items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-indigo-500">
                        <input
                          type="radio"
                          name={`q_${q._id}`}
                          value={tf}
                          checked={answers[q._id] === tf}
                          onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                          className="mr-2 accent-indigo-500"
                        />
                        <span className="text-sm font-bold">{tf}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'confidence_scale' && (
                  <div className="flex justify-between space-x-2 pt-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => handleAnswerChange(q._id, String(num))}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm border ${
                          answers[q._id] === String(num) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <input
                    type="text"
                    required
                    value={answers[q._id] || ''}
                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                    placeholder="Your short answer..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Exit Ticket'}
            </button>
          </form>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-extrabold text-emerald-400">Exit Ticket Submitted!</h2>
            <div className="text-sm text-slate-300">
              Score: <strong>{result.percentage}%</strong> ({result.marksAwarded} / {result.totalMarks} marks)
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider">
              Understanding: {result.understandingLabel}
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Back to Classroom
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
