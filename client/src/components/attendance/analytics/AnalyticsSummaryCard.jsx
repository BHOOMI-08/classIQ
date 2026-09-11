import React from 'react';

export const AnalyticsSummaryCard = ({ title, value, subtext, icon: Icon, color = 'primary' }) => {
  const getColorClass = () => {
    switch (color) {
      case 'success':
        return 'text-success border-t-success';
      case 'warning':
        return 'text-warning border-t-warning';
      case 'danger':
        return 'text-danger border-t-danger';
      default:
        return 'text-primary border-t-primary';
    }
  };

  return (
    <div className={`card p-5 border-t-4 ${getColorClass()} shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-muted font-bold uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="w-5 h-5 opacity-70" />}
      </div>
      <div className="text-3xl font-black mb-1">{value ?? '-'}</div>
      {subtext && <div className="text-xs text-muted font-medium">{subtext}</div>}
    </div>
  );
};
