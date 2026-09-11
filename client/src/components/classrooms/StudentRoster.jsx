import React, { useState } from 'react';
import { Search, UserX, ShieldAlert, CheckCircle2, UserCheck, Shield } from 'lucide-react';

export const StudentRoster = ({
  students = [],
  onRemove,
  onBlock,
  onUnblock,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  const filteredStudents = students.filter((item) => {
    const student = item.studentId || {};
    const profile = item.studentProfile || {};
    const name = student.name || '';
    const email = student.email || '';
    const roll = profile.rollNumber || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="roster-loading-state">Loading student roster...</div>;
  }

  return (
    <div className="student-roster-container">
      {/* Controls Bar */}
      <div className="roster-controls-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by student name, email, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-control"
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-control select-control"
          >
            <option value="active">Active Enrolled</option>
            <option value="removed">Removed</option>
            <option value="blocked">Blocked</option>
            <option value="all">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Roster Table / Card Grid */}
      {filteredStudents.length === 0 ? (
        <div className="roster-empty-state">
          <p>No student records match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="roster-table-wrapper">
          <table className="roster-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Academic Info</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((item) => {
                const student = item.studentId || {};
                const profile = item.studentProfile || {};
                const isBlocked = item.status === 'blocked';
                const isActive = item.status === 'active';

                return (
                  <tr key={item._id} className={`roster-row ${isBlocked ? 'row-blocked' : ''}`}>
                    <td className="student-cell">
                      <div className="student-avatar-box">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.name} />
                        ) : (
                          <span>{(student.name || 'S').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <span className="student-name">{student.name || 'Unknown Student'}</span>
                        <span className="student-email">{student.email}</span>
                      </div>
                    </td>

                    <td>
                      <span className="roll-number">{profile.rollNumber || 'N/A'}</span>
                    </td>

                    <td>
                      <span className="acad-info">
                        {profile.department || 'N/A'} • Sem {profile.semester || 'N/A'} ({profile.section || 'N/A'})
                      </span>
                    </td>

                    <td>
                      <span className="joined-date">
                        {new Date(item.joinedAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge-pill ${item.status}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="actions-cell">
                      {isActive && (
                        <>
                          <button
                            onClick={() => onRemove && onRemove(item)}
                            className="btn-action-text danger"
                            title="Remove student"
                          >
                            <UserX size={14} /> Remove
                          </button>
                          <button
                            onClick={() => onBlock && onBlock(item)}
                            className="btn-action-text block"
                            title="Block student"
                          >
                            <ShieldAlert size={14} /> Block
                          </button>
                        </>
                      )}

                      {isBlocked && (
                        <button
                          onClick={() => onUnblock && onUnblock(item)}
                          className="btn-action-text success"
                          title="Unblock student"
                        >
                          <UserCheck size={14} /> Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentRoster;
