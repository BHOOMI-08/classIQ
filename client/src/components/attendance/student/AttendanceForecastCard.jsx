import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const AttendanceForecastCard = ({ forecast }) => {
  if (!forecast || !forecast.scenarios) return null;

  const { currentPercentage, scenarios } = forecast;

  return (
    <div className="card p-6 my-4">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Scenario Attendance Forecast</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-success/10 border border-success/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium">Attend Next 3</div>
            <div className="text-xl font-black text-success">{scenarios.attendNext3}%</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-success" />
        </div>

        <div className="p-3 rounded-xl bg-success/10 border border-success/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium">Attend Next 5</div>
            <div className="text-xl font-black text-success">{scenarios.attendNext5}%</div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-success" />
        </div>

        <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium">Miss Next 1</div>
            <div className="text-xl font-black text-danger">{scenarios.missNext1}%</div>
          </div>
          <ArrowDownRight className="w-5 h-5 text-danger" />
        </div>

        <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium">Miss Next 2</div>
            <div className="text-xl font-black text-danger">{scenarios.missNext2}%</div>
          </div>
          <ArrowDownRight className="w-5 h-5 text-danger" />
        </div>
      </div>
    </div>
  );
};
