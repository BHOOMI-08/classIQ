import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import enrollmentService from '../../services/enrollmentService';
import { ClassroomCard } from '../../components/classrooms/ClassroomCard';
import { EmptyClassroomState } from '../../components/classrooms/EmptyClassroomState';
import { LeaveClassroomModal } from '../../components/classrooms/LeaveClassroomModal';
import { LogIn, Search, BookOpen, Clock, Megaphone } from 'lucide-react';

export const StudentClassesPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [leaveModalTarget, setLeaveModalTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStudentClasses();
  }, [search]);

  const fetchStudentClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await enrollmentService.getStudentClassrooms({ search });
      setClassrooms(res.data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load enrolled classrooms.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveConfirm = async () => {
    if (!leaveModalTarget) return;
    setActionLoading(true);
    try {
      await enrollmentService.leaveClassroom(leaveModalTarget._id);
      setLeaveModalTarget(null);
      await fetchStudentClasses();
    } catch (err) {
      alert(err.message || 'Failed to leave classroom.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="student-classes-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">My Enrolled Classes</h1>
          <p className="page-subtitle">Access your course materials, schedules, and active classroom workspaces</p>
        </div>
        <Link to="/student/classes/join" className="btn btn-primary">
          <LogIn size={18} /> Join Classroom
        </Link>
      </div>

      {/* Search Bar */}
      <div className="filter-controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search enrolled classrooms by name, subject, or course code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Grid View */}
      {loading ? (
        <div className="loading-grid-skeleton">Loading enrolled classrooms...</div>
      ) : classrooms.length === 0 ? (
        <EmptyClassroomState
          isTeacher={false}
          actionLink="/student/classes/join"
        />
      ) : (
        <div className="classrooms-grid">
          {classrooms.map((classroom) => (
            <ClassroomCard
              key={classroom._id}
              classroom={classroom}
              isTeacher={false}
              onLeave={() => setLeaveModalTarget(classroom)}
            />
          ))}
        </div>
      )}

      {/* Leave Classroom Modal */}
      {leaveModalTarget && (
        <LeaveClassroomModal
          classroom={leaveModalTarget}
          onConfirm={handleLeaveConfirm}
          onClose={() => setLeaveModalTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default StudentClassesPage;
