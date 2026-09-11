import React from 'react';
import { useLocation } from 'react-router-dom';
import { AttendanceSuccessCard } from '../../../components/attendance/student/AttendanceSuccessCard.jsx';
import { AttendanceRejectedCard } from '../../../components/attendance/student/AttendanceRejectedCard.jsx';
import { AttendancePendingCard } from '../../../components/attendance/student/AttendancePendingCard.jsx';

export const AttendanceResultPage = () => {
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return <AttendanceRejectedCard message="No scan result data found." />;
  }

  if (result.decision === 'accepted') {
    return <AttendanceSuccessCard resultData={result} />;
  }

  if (result.decision === 'pending_review') {
    return <AttendancePendingCard />;
  }

  return <AttendanceRejectedCard message={result.message || 'Attendance submission rejected.'} />;
};
