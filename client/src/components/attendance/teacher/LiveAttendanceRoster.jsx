import React, { useState } from 'react';
import { AttendanceStatusBadge } from '../shared/AttendanceStatusBadge.jsx';
import { RiskLevelBadge } from '../shared/RiskLevelBadge.jsx';
import { Edit, Search } from 'lucide-react';

export const LiveAttendanceRoster = ({ records = [], onCorrectRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRecords = records.filter((rec) => {
    const studentName = rec.studentId?.name || '';
    const studentEmail = rec.studentId?.email || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="card p-6 my-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <h3 className="text-lg font-bold">Live Student Roster ({filteredRecords.length})</h3>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 py-1.5 text-sm w-full sm:w-48"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-select py-1.5 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="pending_review">Pending Review</option>
            <option value="absent">Absent</option>
            <option value="excused">Excused</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="p-3">Student</th>
              <th className="p-3">Status</th>
              <th className="p-3">Marked Time</th>
              <th className="p-3">Late (Mins)</th>
              <th className="p-3">Risk Level</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6 text-muted">
                  No attendance records match your filter.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr key={rec._id} className="border-b border-border hover:bg-surface-variant/40">
                  <td className="p-3 font-medium flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {rec.studentId?.name ? rec.studentId.name[0] : 'S'}
                    </div>
                    <div>
                      <div>{rec.studentId?.name || 'Student'}</div>
                      <div className="text-xs text-muted">{rec.studentId?.email}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <AttendanceStatusBadge status={rec.status} />
                  </td>
                  <td className="p-3 text-xs">{rec.markedAt ? new Date(rec.markedAt).toLocaleTimeString() : 'N/A'}</td>
                  <td className="p-3 text-xs">{rec.lateByMinutes > 0 ? `${rec.lateByMinutes} m` : '-'}</td>
                  <td className="p-3">
                    <RiskLevelBadge level={rec.suspicionLevel || 'low'} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onCorrectRecord(rec)}
                      className="btn-secondary btn-sm flex items-center space-x-1 ml-auto text-xs"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
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
