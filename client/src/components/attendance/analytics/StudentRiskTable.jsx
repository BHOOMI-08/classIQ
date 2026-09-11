import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceStatusBadge } from '../shared/AttendanceStatusBadge.jsx';
import { RiskLevelBadge } from '../shared/RiskLevelBadge.jsx';
import { Search, ChevronRight, AlertOctagon } from 'lucide-react';

export const StudentRiskTable = ({ classroomId, students = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHealth, setFilterHealth] = useState('all');

  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      (st.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHealth = filterHealth === 'all' || st.healthStatus === filterHealth;
    return matchesSearch && matchesHealth;
  });

  return (
    <div className="card p-6 my-6 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-bold">Student Risk & Attendance Shortage Roster</h3>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
            <input
              type="text"
              placeholder="Search student or roll #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 py-1.5 text-sm w-full sm:w-56"
            />
          </div>

          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="input-select py-1.5 text-sm"
          >
            <option value="all">All Health Statuses</option>
            <option value="at_risk">At Risk (&lt; 75%)</option>
            <option value="critical">Critical Shortage</option>
            <option value="near_threshold">Near Threshold (75-80%)</option>
            <option value="on_track">On Track (&ge; 80%)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="p-3">Student</th>
              <th className="p-3">Attendance %</th>
              <th className="p-3">Health Status</th>
              <th className="p-3">Safe Leaves</th>
              <th className="p-3">Recovery Needed</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-muted">
                  No student records match your selected criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => (
                <tr key={st.studentId || st._id} className="border-b border-border hover:bg-surface-variant/40">
                  <td className="p-3 font-medium flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                      {st.name ? st.name[0] : 'S'}
                    </div>
                    <div>
                      <div>{st.name || 'Student'}</div>
                      <div className="text-xs text-muted">{st.rollNumber || st.email}</div>
                    </div>
                  </td>
                  <td className="p-3 font-extrabold text-base">
                    <span className={st.attendancePercentage >= 75 ? 'text-success' : 'text-danger'}>
                      {st.attendancePercentage !== null ? `${st.attendancePercentage}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${st.healthStatus === 'on_track' ? 'badge-success' : st.healthStatus === 'near_threshold' ? 'badge-warning' : 'badge-danger'}`}>
                      {(st.healthStatus || 'N/A').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-xs font-bold text-success">{st.safeLeaves || 0}</td>
                  <td className="p-3 text-xs font-bold text-warning">{st.recoveryClasses || 0}</td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/teacher/classes/${classroomId}/attendance/students/${st.studentId || st._id}`}
                      className="btn-secondary btn-sm flex items-center space-x-1 ml-auto text-xs"
                    >
                      <span>View Insight</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
