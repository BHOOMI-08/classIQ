import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

export const AttendanceTrendChart = ({ trends = [] }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="card p-6 my-4 text-center text-muted">
        No attendance trend data available for selected filter.
      </div>
    );
  }

  const formattedData = trends.map((t) => ({
    date: new Date(t.periodStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    percentage: t.attendancePercentage || 0,
    present: t.present || 0,
    late: t.late || 0,
    absent: t.absent || 0,
  }));

  return (
    <div className="card p-6 my-4 shadow-md">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Attendance Percentage Trend</h3>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Attendance Rate']}
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#3B82F6' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
