import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Archive, RotateCw, ArrowLeft } from 'lucide-react';

export const ClassroomHeader = ({
  classroom,
  isTeacher = false,
  activeTab,
  setActiveTab,
  onEdit,
  onArchive,
  onRestore,
}) => {
  const navigate = useNavigate();
  const isArchived = classroom.status === 'archived';

  const teacherTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students Roster' },
    { id: 'schedule', label: 'Weekly Schedule' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'attendance', label: 'Attendance', path: `/teacher/classes/${classroom._id}/attendance` },
    { id: 'resources', label: 'Resources (RAG Content)', path: `/teacher/classes/${classroom._id}/content` },
    { id: 'assignments', label: 'Assignments', path: `/teacher/classes/${classroom._id}/assignments` },
    { id: 'quizzes', label: 'Quizzes & Assessments', path: `/teacher/classes/${classroom._id}/quizzes` },
  ];

  const studentTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'schedule', label: 'Weekly Schedule' },
    { id: 'attendance', label: 'Attendance Health', path: `/student/classes/${classroom._id}/attendance/analytics` },
    { id: 'resources', label: 'Resources', path: `/student/classes/${classroom._id}/content` },
    { id: 'assignments', label: 'Assignments', path: `/student/classes/${classroom._id}/assignments` },
    { id: 'quizzes', label: 'Quizzes & Tests', path: `/student/classes/${classroom._id}/quizzes` },
  ];

  const tabs = isTeacher ? teacherTabs : studentTabs;

  const handleTabClick = (tab) => {
    if (tab.path) {
      navigate(tab.path);
    } else if (setActiveTab) {
      setActiveTab(tab.id);
    }
  };

  return (
    <div className="classroom-header-wrapper">
      <div className="classroom-header-nav">
        <Link to={isTeacher ? '/teacher/classes' : '/student/classes'} className="back-link">
          <ArrowLeft size={16} /> Back to Classrooms
        </Link>
      </div>

      <div className="classroom-header-content">
        <div className="header-info-main">
          <div className="header-badges">
            <span className="badge-dept">{classroom.department}</span>
            <span className="badge-sem">Semester {classroom.semester} ({classroom.section})</span>
            <span className={`badge-status ${isArchived ? 'archived' : 'active'}`}>
              {isArchived ? 'Archived' : 'Active'}
            </span>
          </div>

          <h1 className="classroom-title">{classroom.name}</h1>
          <p className="classroom-subtitle">
            {classroom.subjectName} — Course Code: <b>{classroom.courseCode}</b>
            {classroom.roomNumber && ` • Room: ${classroom.roomNumber}`}
          </p>
        </div>

        {isTeacher && (
          <div className="header-action-group">
            {!isArchived ? (
              <>
                <button onClick={onEdit} className="btn btn-secondary btn-sm">
                  <Edit size={14} /> Edit Class
                </button>
                <button onClick={onArchive} className="btn btn-danger btn-sm">
                  <Archive size={14} /> Archive
                </button>
              </>
            ) : (
              <button onClick={onRestore} className="btn btn-secondary btn-sm">
                <RotateCw size={14} /> Restore Class
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="classroom-tabs-bar" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassroomHeader;
