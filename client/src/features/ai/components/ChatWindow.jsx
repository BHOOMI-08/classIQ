import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, Check, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import CitationList from './CitationList';

export default function ChatWindow({
  messages = [],
  loading = false,
  onSendMessage,
  suggestedQuestions = [
    'Can you summarize the main concepts from our latest lecture notes?',
    'What are the key formulas covered in Unit 2?',
    'Explain the core definitions with examples from class notes.',
  ],
}) {
  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Status Header */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">ClassIQ AI Academic Tutor</h3>
            <p className="text-[11px] text-slate-400">Strictly grounded in your classroom study materials</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" /> Grounded Mode Active
        </span>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[500px]">
        {messages.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Ask any question from your course resources</h4>
              <p className="text-xs text-slate-400">
                Our tutor searches only your teacher-uploaded notes and PDFs. If information is missing, it will clearly inform you.
              </p>
            </div>

            {/* Suggested Follow-up Questions */}
            <div className="pt-4 max-w-lg mx-auto space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
                <HelpCircle className="w-3 h-3 text-indigo-400" /> Suggested Prompts:
              </span>
              <div className="flex flex-col gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(q)}
                    className="text-left text-xs bg-slate-950/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-xl text-slate-300 hover:text-indigo-200 transition"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const msgId = msg._id || idx;

            return (
              <div key={msgId} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 shadow-md relative group ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 pb-1 border-b border-slate-800/60">
                    <span className="font-bold">{isUser ? 'You' : 'ClassIQ AI Tutor'}</span>
                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {msg.grounded ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Grounded
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Limited Context
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(msg.content, msgId)}
                          className="hover:text-white transition p-1"
                          title="Copy Answer"
                        >
                          {copiedId === msgId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap leading-relaxed text-slate-100">{msg.content}</p>

                  {/* Render citations if assistant message */}
                  {!isUser && msg.citations && msg.citations.length > 0 && <CitationList citations={msg.citations} />}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-bl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Analyzing uploaded classroom resources & generating grounded answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-950/80 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about your classroom study materials..."
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
}
