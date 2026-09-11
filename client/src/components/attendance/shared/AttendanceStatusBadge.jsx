import React from 'react';

export const AttendanceStatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'present':
        return 'badge-success';
      case 'late':
        return 'badge-warning';
      case 'absent':
        return 'badge-danger';
      case 'excused':
        return 'badge-info';
      case 'pending_review':
        return 'badge-secondary';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      case 'excused':
        return 'Excused';
      case 'pending_review':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return status || 'Unknown';
    }
  };

  return <span className={`badge ${getBadgeStyle()}`}>{getLabel()}</span>;
};
