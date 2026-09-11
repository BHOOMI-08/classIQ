import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { pollService } from '../../services/pollService.js';
import { useEngagementSocket } from '../../hooks/useEngagementSocket.js';
import PollBuilderModal from '../../components/PollBuilderModal.jsx';
import PollDistributionChart from '../../components/PollDistributionChart.jsx';

export default function TeacherPollsPage() {
  const { classId } = useParams();
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [results, setResults] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const fetchPolls = useCallback(async () => {
    try {
      const res = await pollService.getClassroomPolls(classId);
      const list = res.data?.polls || [];
      setPolls(list);
      const active = list.find((p) => p.status === 'active');
      if (active) {
        setActivePoll(active);
        const resData = await pollService.getPollById(active._id);
        setResults(resData.data);
      }
    } catch (_) {}
  }, [classId]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleSocketEvent = useCallback((event) => {
    if (event.startsWith('poll-')) {
      fetchPolls();
    }
  }, [fetchPolls]);

  useEngagementSocket(classId, handleSocketEvent);

  const handleCreatePoll = async (data) => {
    const created = await pollService.createPoll(classId, data);
    const newPollId = created.data?.poll?._id;
    if (newPollId) {
      await pollService.startPoll(newPollId, data.durationMinutes || 5);
      fetchPolls();
    }
  };

  const handleClosePoll = async () => {
    if (!activePoll) return;
    await pollService.closePoll(activePoll._id);
    setActivePoll(null);
    setResults(null);
    fetchPolls();
  };

  const handleRevealAnswer = async () => {
    if (!activePoll) return;
    await pollService.revealAnswer(activePoll._id);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Live Polls Control</h1>
          <p className="text-sm text-slate-400">Publish interactive MCQ, Concept Check, True/False, and Opinion polls</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition-all shadow-lg"
        >
          + Create New Poll
        </button>
      </div>

      {activePoll && results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Active Poll: {activePoll.question}</span>
            <div className="flex space-x-2">
              <button
                onClick={handleRevealAnswer}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold"
              >
                Reveal Answer Key
              </button>
              <button
                onClick={handleClosePoll}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold"
              >
                Close Poll
              </button>
            </div>
          </div>
          <PollDistributionChart
            optionDistribution={results.optionDistribution}
            totalResponses={results.totalResponses}
            accuracyPercentage={results.accuracyPercentage}
          />
        </div>
      )}

      {/* History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Poll History</h3>
        <div className="space-y-3">
          {polls.map((p) => (
            <div key={p._id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase">{p.type}</span>
                <h4 className="text-sm font-bold text-slate-200">{p.question}</h4>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-700 uppercase font-bold text-slate-300">{p.status}</span>
            </div>
          ))}
        </div>
      </div>

      <PollBuilderModal
        isOpen={showBuilder}
        onClose={() => setShowBuilder(false)}
        onCreatePoll={handleCreatePoll}
      />
    </div>
  );
}
