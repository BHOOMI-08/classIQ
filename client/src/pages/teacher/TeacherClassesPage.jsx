import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classroomService from '../../services/classroomService';
import { ClassroomCard } from '../../components/classrooms/ClassroomCard';
import { EmptyClassroomState } from '../../components/classrooms/EmptyClassroomState';
import { ArchiveClassroomModal } from '../../components/classrooms/ArchiveClassroomModal';
import { RegenerateCodeModal } from '../../components/classrooms/RegenerateCodeModal';
import { Plus, Search, Filter, BookOpen, Users, Clock, Archive } from 'lucide-react';

export const TeacherClassesPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Modals
  const [archiveModalTarget, setArchiveModalTarget] = useState(null);
  const [regenerateModalTarget, setRegenerateModalTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, [search, status, department, semester, pagination.page]);

  const fetchClassrooms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await classroomService.getTeacherClassrooms({
        search,
        status,
        department,
        semester,
        page: pagination.page,
        limit: 9,
      });
      setClassrooms(res.data.items || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load classrooms.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveModalTarget) return;
    setActionLoading(true);
    try {
      await classroomService.archiveClassroom(archiveModalTarget._id);
      setArchiveModalTarget(null);
      await fetchClassrooms();
    } catch (err) {
      alert(err.message || 'Failed to archive classroom.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreConfirm = async (classroom) => {
    try {
      await classroomService.restoreClassroom(classroom._id);
      await fetchClassrooms();
    } catch (err) {
      alert(err.message || 'Failed to restore classroom.');
    }
  };

  const handleRegenerateConfirm = async () => {
    if (!regenerateModalTarget) return;
    setActionLoading(true);
    try {
      await classroomService.regenerateJoinCode(regenerateModalTarget._id);
      setRegenerateModalTarget(null);
      await fetchClassrooms();
    } catch (err) {
      alert(err.message || 'Failed to regenerate join code.');
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = classrooms.filter((c) => c.status === 'active').length;
  const totalStudents = classrooms.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);

  return (
    <div className="teacher-classes-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">My Classrooms</h1>
          <p className="page-subtitle">Manage multi-department classrooms, schedules, and student enrollment</p>
        </div>
        <Link to="/teacher/classes/create" className="btn btn-primary">
          <Plus size={18} /> Create Classroom
        </Link>
      </div>

      {/* Summary Counters Bar */}
      <div className="summary-cards-grid">
        <div className="summary-card">
          <div className="card-icon-circle green">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="summary-num">{activeCount}</span>
            <span className="summary-lbl">Active Classrooms</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-circle blue">
            <Users size={20} />
          </div>
          <div>
            <span className="summary-num">{totalStudents}</span>
            <span className="summary-lbl">Enrolled Students</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-circle sage">
            <Archive size={20} />
          </div>
          <div>
            <span className="summary-num">{status === 'archived' ? classrooms.length : '—'}</span>
            <span className="summary-lbl">Archived Classes</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="filter-controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by class name, subject, or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="input-control"
          />
        </div>

        <div className="filter-selects-group">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="input-control select-control"
          >
            <option value="active">Active Classrooms</option>
            <option value="archived">Archived Classrooms</option>
            <option value="all">All Classrooms</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Classrooms Grid */}
      {loading ? (
        <div className="loading-grid-skeleton">Loading classrooms...</div>
      ) : classrooms.length === 0 ? (
        <EmptyClassroomState
          isTeacher={true}
          actionLink="/teacher/classes/create"
        />
      ) : (
        <div className="classrooms-grid">
          {classrooms.map((classroom) => (
            <ClassroomCard
              key={classroom._id}
              classroom={classroom}
              isTeacher={true}
              onArchive={() => setArchiveModalTarget(classroom)}
              onRestore={handleRestoreConfirm}
              onRegenerateCode={() => setRegenerateModalTarget(classroom)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {archiveModalTarget && (
        <ArchiveClassroomModal
          classroom={archiveModalTarget}
          onConfirm={handleArchiveConfirm}
          onClose={() => setArchiveModalTarget(null)}
          loading={actionLoading}
        />
      )}

      {regenerateModalTarget && (
        <RegenerateCodeModal
          classroom={regenerateModalTarget}
          onConfirm={handleRegenerateConfirm}
          onClose={() => setRegenerateModalTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default TeacherClassesPage;
