import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, BookOpen, ShieldCheck, ThumbsUp, ThumbsDown, MessageSquare, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import aiService from '../../../services/aiService';

export default function StudentAITutorPage() {
  const [classroomId, setClassroomId] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await aiService.getTutorConversations();
      setConversations(res.data.conversations || []);
      if (res.data.conversations?.length > 0) {
        setActiveConversation(res.data.conversations[0]);
      }
    } catch (_) {}
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await aiService.getTutorMessages(convId);
      setMessages(res.data.messages || []);
    } catch (_) {}
  };

  const handleCreateConversation = async () => {
    if (!classroomId) return alert('Please enter Classroom ID');
    try {
      const res = await aiService.createTutorConversation({ classroomId });
      const newConv = res.data.conversation;
      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv);
    } catch (err) {
      alert(err.message || 'Failed to create conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Optimistic user message render
    const tempUserMsg = { _id: Date.now(), role: 'user', content: userText };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await aiService.sendTutorMessage(activeConversation._id, {
        message: userText,
      });
      const assistantMsg = res.data.message;
      setMessages((prev) => [...prev.filter((m) => m._id !== tempUserMsg._id), tempUserMsg, assistantMsg]);
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
        {/* Sidebar: Conversations */}
        <aside className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Tutor Chats</span>
            <button
              onClick={handleCreateConversation}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400">Classroom ID for new chat</label>
              <input
                type="text"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                placeholder="Paste Classroom ID"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveConversation(c)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition line-clamp-1 ${
                  activeConversation?._id === c._id
                    ? 'bg-indigo-950 border-indigo-600 text-indigo-200 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 inline mr-2 text-indigo-400" />
                {c.title || 'Untitled Chat'}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Chat Workspace */}
        <section className="md:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[600px]">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Context-Grounded AI Tutor</h2>
                <p className="text-[11px] text-slate-400">Strictly grounded in teacher-uploaded classroom notes & PDFs</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Grounding Active
            </span>
          </div>

          {/* Messages Stream */}
          <div className="py-4 space-y-4 flex-1 overflow-y-auto max-h-[450px]">
            {messages.length === 0 ? (
              <div className="py-20 text-center space-y-3 text-slate-500">
                <Sparkles className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-xs">Ask any question grounded in your classroom study resources.</p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={m._id || idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white font-medium rounded-br-none shadow-lg'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-inner'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {/* Citations list if assistant */}
                    {m.role === 'assistant' && m.citations && m.citations.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Citations ({m.citations.length})</span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.citations.map((c, cIdx) => (
                            <span key={cIdx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded">
                              Source: {c.resourceTitle}, Page {c.pageNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about your course materials..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
