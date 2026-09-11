import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { exitTicketService } from '../../services/exitTicketService.js';
import { useEngagementSocket } from '../../hooks/useEngagementSocket.js';
import ExitTicketBuilder from '../../components/ExitTicketBuilder.jsx';
import AIExitTicketGeneratorModal from '../../components/AIExitTicketGeneratorModal.jsx';

export default function TeacherExitTicketsPage() {
  const { classId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await exitTicketService.getClassroomExitTickets(classId);
      setTickets(res.data?.tickets || []);
    } catch (_) {}
  }, [classId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSocketEvent = useCallback((event) => {
    if (event.startsWith('exit-ticket-')) {
      fetchTickets();
    }
  }, [fetchTickets]);

  useEngagementSocket(classId, handleSocketEvent);

  const handleCreateTicket = async (data) => {
    const created = await exitTicketService.createExitTicket(classId, data);
    const id = created.data?.ticket?._id;
    if (id) {
      await exitTicketService.startExitTicket(id);
      fetchTickets();
    }
  };

  const handleGenerateAITicket = async (data) => {
    const res = await exitTicketService.generateAIExitTicket(classId, data);
    const draft = res.data?.draft;
    if (draft) {
      await exitTicketService.createExitTicket(classId, draft);
      fetchTickets();
    }
  };

  const handleStart = async (id) => {
    await exitTicketService.startExitTicket(id);
    fetchTickets();
  };

  const handleClose = async (id) => {
    await exitTicketService.closeExitTicket(id);
    fetchTickets();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Adaptive Exit Tickets</h1>
          <p className="text-sm text-slate-400">Launch 2–5 minute lecture assessment tickets with RAG AI support</p>
        </div>
      </div>

      <ExitTicketBuilder
        onCreateTicket={handleCreateTicket}
        onOpenAIGenerator={() => setShowAIGenerator(true)}
      />

      {/* Existing Exit Tickets List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Classroom Exit Tickets</h3>
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t._id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase">{t.topic}</span>
                <h4 className="text-sm font-bold text-slate-200">{t.title}</h4>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-700 uppercase font-bold text-slate-300">{t.status}</span>
                {t.status === 'draft' && (
                  <button onClick={() => handleStart(t._id)} className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold">
                    Launch
                  </button>
                )}
                {t.status === 'active' && (
                  <button onClick={() => handleClose(t._id)} className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold">
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AIExitTicketGeneratorModal
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onGenerate={handleGenerateAITicket}
      />
    </div>
  );
}
