import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';

export const AnalyticsFilterBar = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-primary" />
        <span className="font-bold text-sm">Analytics Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <select
            value={filters.period || '30d'}
            onChange={(e) => onFilterChange('period', e.target.value)}
            className="input-select py-1.5 text-xs"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="month">Current Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div>
          <select
            value={filters.groupBy || 'day'}
            onChange={(e) => onFilterChange('groupBy', e.target.value)}
            className="input-select py-1.5 text-xs"
          >
            <option value="day">Group by Day</option>
            <option value="week">Group by Week</option>
            <option value="month">Group by Month</option>
          </select>
        </div>

        <button onClick={onReset} className="btn-secondary btn-sm flex items-center space-x-1">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
