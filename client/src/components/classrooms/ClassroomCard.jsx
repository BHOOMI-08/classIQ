import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Copy, Check, MoreVertical, Archive, RotateCw, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';

export const ClassroomCard = ({
  classroom,
  isTeacher = false,
  onArchive,
  onRestore,
  onRegenerateCode,
  onLeave,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopyCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (classroom.joinCode) {
      navigator.clipboard.writeText(classroom.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isArchived = classroom.status === 'archived';

  return (
    <div className={`classroom-card ${isArchived ? 'archived' : ''}`}>
      <div className="classroom-card-header">
        <div>
          <span className="classroom-dept-tag">
            {classroom.department} • Sem {classroom.semester} ({classroom.section})
          </span>
          <h3 className="classroom-name">{classroom.name}</h3>
          <p className="classroom-subject">{classroom.subjectName} ({classroom.courseCode})</p>
        </div>

        {isTeacher && (
          <div className="card-menu-wrapper">
            <button
              className="card-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Classroom actions menu"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div className="card-dropdown-menu" onClick={() => setMenuOpen(false)}>
                {isArchived ? (
                  <button onClick={() => onRestore && onRestore(classroom)} className="dropdown-item">
                    <RotateCw size={14} /> Restore Classroom
                  </button>
                ) : (
                  <>
                    <button onClick={handleCopyCode} className="dropdown-item">
                      {copied ? <Check size={14} /> : <Copy size={14} />} Copy Join Code
                    </button>
                    <button onClick={() => onRegenerateCode && onRegenerateCode(classroom)} className="dropdown-item">
                      <RotateCw size={14} /> Regenerate Join Code
                    </button>
                    <button onClick={() => onArchive && onArchive(classroom)} className="dropdown-item danger">
                      <Archive size={14} /> Archive Classroom
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="classroom-card-body">
        {isTeacher ? (
          <div className="card-meta-row">
            <div className="meta-pill">
              <Users size={14} /> <b>{classroom.studentCount || 0}</b> Students
            </div>
            <div className="join-code-badge" onClick={handleCopyCode} title="Click to copy code">
              Join Code: <b>{classroom.joinCode}</b>
              {copied ? <Check size={12} className="copy-check" /> : <Copy size={12} />}
            </div>
          </div>
        ) : (
          <div className="card-meta-row">
            <div className="meta-pill">
              Teacher: <b>{classroom.teacherId?.name || 'Faculty Member'}</b>
            </div>
          </div>
        )}

        {classroom.schedules && classroom.schedules.length > 0 ? (
          <div className="next-lecture-pill">
            <Clock size={13} /> Next Lecture: <b>{classroom.schedules[0].dayOfWeek.toUpperCase()} {classroom.schedules[0].startTime} - {classroom.schedules[0].endTime}</b>
          </div>
        ) : (
          <div className="next-lecture-pill empty">
            <Clock size={13} /> No weekly schedule set
          </div>
        )}
      </div>

      <div className="classroom-card-footer">
        <span className={`status-pill ${isArchived ? 'archived' : 'active'}`}>
          {isArchived ? 'Archived' : 'Active'}
        </span>

        <div className="footer-actions">
          {!isTeacher && classroom.allowStudentLeave && !isArchived && (
            <button
              onClick={() => onLeave && onLeave(classroom)}
              className="btn-text-danger"
              title="Leave Classroom"
            >
              Leave
            </button>
          )}

          <Link
            to={isTeacher ? `/teacher/classes/${classroom._id}` : `/student/classes/${classroom._id}`}
            className="btn btn-primary btn-sm"
          >
            Open Classroom <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClassroomCard;
