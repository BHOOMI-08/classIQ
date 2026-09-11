import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { pulseService } from '../../services/pulseService.js';
import { pollService } from '../../services/pollService.js';
import { doubtService } from '../../services/doubtService.js';
import { exitTicketService } from '../../services/exitTicketService.js';
import { useEngagementSocket } from '../../hooks/useEngagementSocket.js';
import ActivePulseCard from '../../components/ActivePulseCard.jsx';
import ActivePollCard from '../../components/ActivePollCard.jsx';
import AnonymousDoubtForm from '../../components/AnonymousDoubtForm.jsx';
import DoubtCard from '../../components/DoubtCard.jsx';

export default function StudentEngagementPage() {
  const { classId } = useParams();
  const [activePulse, setActivePulse] = useState(null);
  const [activePoll, setActivePoll] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [myDoubts, setMyDoubts] = useState([]);
  const [matchingDoubts, setMatchingDoubts] = useState([]);

  const fetchActiveSessions = useCallback(async () => {
    try {
      // 1. Pulses
      const pulseRes = await pulseService.getClassroomPulses(classId);
      const pulse = (pulseRes.data?.pulses || []).find((p) => p.status === 'active');
      setActivePulse(pulse || null);

      // 2. Polls
      const pollRes = await pollService.getClassroomPolls(classId);
      const poll = (pollRes.data?.polls || []).find((p) => p.status === 'active');
      setActivePoll(poll || null);
      if (poll) {
        const pollDetails = await pollService.getPollById(poll._id);
        setPollOptions(pollDetails.data?.optionDistribution || []);
      }

      // 3. Exit Tickets
      const ticketRes = await exitTicketService.getClassroomExitTickets(classId);
      const ticket = (ticketRes.data?.tickets || []).find((t) => t.status === 'active');
      setActiveTicket(ticket || null);

      // 4. Student's Doubts
      const doubtRes = await doubtService.getMyDoubts(classId);
      setMyDoubts(doubtRes.data?.doubts || []);
    } catch (_) {}
  }, [classId]);

  useEffect(() => {
    fetchActiveSessions();
  }, [fetchActiveSessions]);

  const handleSocketEvent = useCallback((event) => {
    fetchActiveSessions();
  }, [fetchActiveSessions]);

  useEngagementSocket(classId, handleSocketEvent);

  const handleSubmitPulse = async (responseOption) => {
    if (!activePulse) return;
    await pulseService.respondPulse(activePulse._id, responseOption);
  };

  const handleSubmitPoll = async (payload) => {
    if (!activePoll) return;
    await pollService.respondPoll(activePoll._id, payload);
  };

  const handleSubmitDoubt = async (payload) => {
    const res = await doubtService.submitDoubt(classId, payload);
    if (res.data?.matchResult?.matchingDoubts?.length > 0) {
      setMatchingDoubts(res.data.matchResult.matchingDoubts);
    } else {
      setMatchingDoubts([]);
    }
    fetchActiveSessions();
  };

  const handleUpvoteDoubt = async (doubtId) => {
    await doubtService.upvoteDoubt(doubtId);
    fetchActiveSessions();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-100">Classroom Live Portal</h1>
        <p className="text-xs text-slate-400">Participate in live pulses, polls, doubts, and exit tickets</p>
      </div>

      {/* Active Exit Ticket Notification */}
      {activeTicket && (
        <div className="p-5 rounded-3xl bg-indigo-600 border border-indigo-400 text-white flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-200">Active Exit Ticket</span>
            <h3 className="font-extrabold text-lg">{activeTicket.title}</h3>
          </div>
          <a
            href={`/student/exit-tickets/${activeTicket._id}/attempt`}
            className="px-5 py-2.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-slate-100 transition-all"
          >
            Take Exit Ticket →
          </a>
        </div>
      )}

      {/* Active Pulse */}
      {activePulse && (
        <ActivePulseCard pulse={activePulse} onSubmitResponse={handleSubmitPulse} />
      )}

      {/* Active Poll */}
      {activePoll && (
        <ActivePollCard poll={activePoll} options={pollOptions} onSubmitResponse={handleSubmitPoll} />
      )}

      {/* Anonymous Doubt Submission */}
      <AnonymousDoubtForm onSubmitDoubt={handleSubmitDoubt} matchingDoubts={matchingDoubts} />

      {/* My Submitted Doubts */}
      {myDoubts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-200">My Anonymous Doubts ({myDoubts.length})</h3>
          <div className="space-y-3">
            {myDoubts.map((d) => (
              <DoubtCard key={d._id} doubt={d} onUpvote={handleUpvoteDoubt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
