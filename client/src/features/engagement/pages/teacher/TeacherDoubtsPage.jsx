import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doubtService } from '../../services/doubtService.js';
import { useEngagementSocket } from '../../hooks/useEngagementSocket.js';
import DoubtCard from '../../components/DoubtCard.jsx';
import DoubtClusterCard from '../../components/DoubtClusterCard.jsx';

export default function TeacherDoubtsPage() {
  const { classId } = useParams();
  const [doubts, setDoubts] = useState([]);
  const [clusters, setClusters] = useState([]);

  const fetchDoubts = useCallback(async () => {
    try {
      const res = await doubtService.getClassroomDoubts(classId);
      setDoubts(res.data?.doubts || []);
      setClusters(res.data?.clusters || []);
    } catch (_) {}
  }, [classId]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  const handleSocketEvent = useCallback((event) => {
    if (event.startsWith('doubt-')) {
      fetchDoubts();
    }
  }, [fetchDoubts]);

  useEngagementSocket(classId, handleSocketEvent);

  const handleResolve = async (doubtId) => {
    const note = prompt('Enter public resolution note for classroom (optional):') || '';
    await doubtService.resolveDoubt(doubtId, note);
    fetchDoubts();
  };

  const handleRebuildClusters = async () => {
    await doubtService.rebuildClusters(classId);
    fetchDoubts();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Anonymous Doubt Queue</h1>
          <p className="text-sm text-slate-400">Prioritized, deduplicated, and clustered student doubts (Identities stripped)</p>
        </div>
        <button
          onClick={handleRebuildClusters}
          className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 font-bold text-xs text-indigo-300"
        >
          🔄 Rebuild AI Clusters
        </button>
      </div>

      {/* Clusters Section */}
      {clusters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-200">Grouped Doubt Clusters ({clusters.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clusters.map((c) => (
              <DoubtClusterCard key={c._id} cluster={c} />
            ))}
          </div>
        </div>
      )}

      {/* Doubts Priority Queue */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-200">Priority Doubt Queue ({doubts.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doubts.map((d) => (
            <DoubtCard key={d._id} doubt={d} isTeacher onResolve={handleResolve} />
          ))}
        </div>

        {doubts.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-sm italic">
            No doubts submitted by students yet.
          </div>
        )}
      </div>
    </div>
  );
}
