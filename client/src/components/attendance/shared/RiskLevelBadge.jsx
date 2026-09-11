import React from 'react';

export const RiskLevelBadge = ({ level }) => {
  const getStyle = () => {
    switch (level) {
      case 'low':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'high':
        return 'badge-danger';
      case 'critical':
        return 'badge-danger font-bold';
      default:
        return 'badge-neutral';
    }
  };

  return <span className={`badge ${getStyle()}`}>{level ? level.toUpperCase() : 'LOW'}</span>;
};
