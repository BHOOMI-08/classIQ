import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classroomService from '../../services/classroomService';
import announcementService from '../../services/announcementService';
import enrollmentService from '../../services/enrollmentService';

import { ClassroomHeader } from '../../components/classrooms/ClassroomHeader';
import { ScheduleList } from '../../components/classrooms/ScheduleList';
import { AnnouncementCard } from '../../components/classrooms/AnnouncementCard';
import { LeaveClassroomModal } from '../../components/classrooms/LeaveClassroomModal';
import { BookOpen, Clock, User, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';

export const StudentClassroomPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  useEffect(() => {
    fetchClassroomData();
  }, [classId]);

  const fetchClassroomData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await classroomService.getClassroomById(classId);
      const data = res.data;
      setClassroom(data.classroom);
      setSchedules(data.classroom.schedules || []);
      setAnnouncements(data.classroom.announcements || []);
    } catch (err) {
      setError(err.message || 'Failed to load classroom workspace details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveConfirm = async () => {
    setLeaveLoading(true);
    try {
      await enrollmentService.leaveClassroom(classId);
      setLeaveModalOpen(false);
      navigate('/student/classes');
    } catch (err) {
      alert(err.message || 'Failed to leave classroom.');
    } finally {
      setLeaveLoading(false);
    }
  };

  if (loading) return <div className="loading-state-center">Loading classroom workspace...</div>;
  if (error) return <div className="alert alert-error m-4">{error}</div>;
  if (!classroom) return null;

  return (
    <div className="classroom-workspace-page">
      <ClassroomHeader
        classroom={classroom}
        isTeacher={false}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Workspace Tab Content */}
      <div className="workspace-tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab-grid">
            <div className="left-col">
              {/* Teacher Metadata Card */}
              <div className="card workspace-card">
                <div className="teacher-info-box">
                  <div className="avatar-md">
                    {(classroom.teacherId?.name || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="info-lbl">Course Teacher</span>
                    <h4 className="teacher-name">{classroom.teacherId?.name || 'Faculty Member'}</h4>
                    <p className="teacher-email">{classroom.teacherId?.email}</p>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule Preview */}
              <div className="card workspace-card">
                <h3>Weekly Lecture Schedule</h3>
                <ScheduleList schedules={schedules} />
              </div>
            </div>

            <div className="right-col">
              {/* Classroom Info & Leave Controls */}
              <div className="card workspace-card">
                <h3>Classroom Policy</h3>
                <div className="policy-list">
                  <div className="policy-item">
                    <span>Attendance Requirement:</span> <b>{classroom.attendanceThreshold || 75}%</b>
                  </div>
                  <div className="policy-item">
                    <span>Student Self-Leave Policy:</span>{' '}
                    <b>{classroom.allowStudentLeave ? 'Enabled' : 'Disabled by Teacher'}</b>
                  </div>
                </div>

                {classroom.allowStudentLeave ? (
                  <button
                    onClick={() => setLeaveModalOpen(true)}
                    className="btn btn-danger btn-sm mt-4 w-full"
                  >
                    <LogOut size={14} /> Leave Classroom
                  </button>
                ) : (
                  <p className="leave-disabled-note mt-3">
                    Leaving this classroom is controlled by your teacher.
                  </p>
                )}
              </div>

              {/* Announcements Preview */}
              <div className="card workspace-card">
                <div className="card-title-row">
                  <h3>Announcements ({announcements.length})</h3>
                  <button onClick={() => setActiveTab('announcements')} className="btn-text-link">
                    View All
                  </button>
                </div>

                <div className="announcements-preview-list">
                  {announcements.slice(0, 2).map((a) => (
                    <AnnouncementCard key={a._id} announcement={a} isTeacher={false} />
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>No announcements posted yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="announcements-workspace-wrapper">
            <div className="announcements-list-wrapper">
              {announcements.map((a) => (
                <AnnouncementCard key={a._id} announcement={a} isTeacher={false} />
              ))}
              {announcements.length === 0 && (
                <p className="text-muted text-center" style={{ padding: '2rem' }}>
                  No announcements published in this classroom yet.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-workspace-wrapper">
            <ScheduleList schedules={schedules} />
          </div>
        )}
      </div>

      {/* Leave Modal */}
      {leaveModalOpen && (
        <LeaveClassroomModal
          classroom={classroom}
          onConfirm={handleLeaveConfirm}
          onClose={() => setLeaveModalOpen(false)}
          loading={leaveLoading}
        />
      )}
    </div>
  );
};

export default StudentClassroomPage;
