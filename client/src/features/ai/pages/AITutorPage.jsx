import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import aiService from '../../../services/aiService';
import ChatWindow from '../components/ChatWindow';

export default function AITutorPage() {
  const [classroomId, setClassroomId] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const fetchHistory = async () => {
    try {
      const res = await aiService.getTutorHistory();
      const list = res.data?.conversations || [];
      setConversations(list);
      if (list.length > 0) {
        setActiveConversation(list[0]);
      }
    } catch (_) {}
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await aiService.getTutorMessages(convId);
      setMessages(res.data?.messages || []);
    } catch (_) {}
  };

  const handleSendMessage = async (textMessage) => {
    if (!textMessage || !textMessage.trim()) return;

    setLoading(true);
    const tempUserMsg = { _id: Date.now(), role: 'user', content: textMessage };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await aiService.chatTutor({
        message: textMessage,
        classroomId: classroomId || activeConversation?.classroomId?._id || activeConversation?.classroomId || 'default_class',
        conversationId: activeConversation?._id || null,
      });

      const assistantMsg = res.data?.assistantMessage;
      const updatedConv = res.data?.conversation;

      if (updatedConv && !activeConversation) {
        setActiveConversation(updatedConv);
        setConversations([updatedConv, ...conversations]);
      }

      if (assistantMsg) {
        setMessages((prev) => [...prev.filter((m) => m._id !== tempUserMsg._id), tempUserMsg, assistantMsg]);
      }
    } catch (err) {
      alert(err.message || 'Failed to generate tutor response');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation history?')) return;

    try {
      await aiService.deleteTutorHistory(convId);
      const remaining = conversations.filter((c) => c._id !== convId);
      setConversations(remaining);
      if (activeConversation?._id === convId) {
        setActiveConversation(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete conversation');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 flex flex-col">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
        {/* Sidebar */}
        <aside className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Tutor Chats
            </span>
            <button
              onClick={() => {
                setActiveConversation(null);
                setMessages([]);
              }}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
              title="New Conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-[10px] text-slate-400">Target Classroom ID</label>
            <input
              type="text"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              placeholder="Paste Classroom ID"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto">
            {conversations.map((c) => (
              <div
                key={c._id}
                onClick={() => setActiveConversation(c)}
                className={`group flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                  activeConversation?._id === c._id
                    ? 'bg-indigo-950/80 border-indigo-600 text-indigo-200 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{c.title || 'Academic Tutor Session'}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c._id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="md:col-span-3 min-h-[600px]">
          <ChatWindow
            messages={messages}
            loading={loading}
            onSendMessage={handleSendMessage}
          />
        </main>
      </div>
    </div>
  );
}
