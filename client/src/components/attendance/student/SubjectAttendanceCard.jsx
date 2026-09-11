import React from 'react';
import { AttendanceProgressBar } from '../shared/AttendanceProgressBar.jsx';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SubjectAttendanceCard = ({ subjectHealth }) => {
  if (!subjectHealth) return null;

  return (
    <div className="card p-5 my-3 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-bold text-base">{subjectHealth.subjectName || subjectHealth.classroomName}</h4>
          <span className="text-xs text-muted">{subjectHealth.courseCode}</span>
        </div>
        <Link
          to={`/student/attendance/health?classId=${subjectHealth.classroomId}`}
          className="btn-text btn-sm flex items-center text-xs"
        >
          <span>View Health</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      <AttendanceProgressBar percentage={subjectHealth.currentPercentage} threshold={subjectHealth.attendanceThreshold} />
    </div>
  );
};
