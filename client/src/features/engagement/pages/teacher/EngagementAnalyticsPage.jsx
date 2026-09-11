import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { engagementAnalyticsService } from '../../services/engagementAnalyticsService.js';
import ConfusionHeatmap from '../../components/ConfusionHeatmap.jsx';

export default function EngagementAnalyticsPage() {
  const { classId } = useParams();
  const [heatmap, setHeatmap] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await engagementAnalyticsService.getEngagementOverview(classId);
      setHeatmap(res.data?.heatmap || []);
      setSummary(res.data?.summary || null);
    } catch (_) {}
  }, [classId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Classroom Intelligence & Analytics</h1>
          <p className="text-sm text-slate-400">Explainable engagement insights and multi-signal confusion heatmaps</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium block">Total Tracked Topics</span>
            <strong className="text-2xl font-bold text-slate-100">{summary.totalTopics}</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium block">Critical Confusion Topics</span>
            <strong className="text-2xl font-bold text-rose-400">{summary.criticalCount}</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium block">High Concern Topics</span>
            <strong className="text-2xl font-bold text-orange-400">{summary.highCount}</strong>
          </div>
        </div>
      )}

      <ConfusionHeatmap heatmap={heatmap} />
    </div>
  );
}
