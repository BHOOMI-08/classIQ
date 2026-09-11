import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

export const AttendanceDistributionChart = ({ statusCounts = {} }) => {
  const data = [
    { name: 'Present', value: statusCounts.present || 0, color: '#10B981' },
    { name: 'Late', value: statusCounts.late || 0, color: '#F59E0B' },
    { name: 'Absent', value: statusCounts.absent || 0, color: '#EF4444' },
    { name: 'Excused', value: statusCounts.excused || 0, color: '#3B82F6' },
    { name: 'Pending', value: statusCounts.pendingReview || 0, color: '#8B5CF6' },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="card p-6 my-4 text-center text-muted">
        No attendance distribution data available.
      </div>
    );
  }

  return (
    <div className="card p-6 my-4 shadow-md">
      <div className="flex items-center space-x-2 mb-4">
        <PieIcon className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Status Distribution</h3>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', color: '#fff' }} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
