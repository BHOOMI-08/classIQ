import React from 'react';

export const SessionStatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'active':
        return 'badge-success pulse';
      case 'ended':
        return 'badge-neutral';
      case 'cancelled':
        return 'badge-danger';
      case 'expired':
        return 'badge-warning';
      case 'scheduled':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  return <span className={`badge ${getBadgeStyle()}`}>{status ? status.toUpperCase() : 'UNKNOWN'}</span>;
};
