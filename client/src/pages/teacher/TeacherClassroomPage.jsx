import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classroomService from '../../services/classroomService';
import scheduleService from '../../services/scheduleService';
import announcementService from '../../services/announcementService';
import enrollmentService from '../../services/enrollmentService';

import { ClassroomHeader } from '../../components/classrooms/ClassroomHeader';
import { JoinCodeCard } from '../../components/classrooms/JoinCodeCard';
import { ScheduleList } from '../../components/classrooms/ScheduleList';
import { ScheduleEditor } from '../../components/classrooms/ScheduleEditor';
import { StudentRoster } from '../../components/classrooms/StudentRoster';
import { AnnouncementComposer } from '../../components/classrooms/AnnouncementComposer';
import { AnnouncementCard } from '../../components/classrooms/AnnouncementCard';
import { ArchiveClassroomModal } from '../../components/classrooms/ArchiveClassroomModal';
import { RegenerateCodeModal } from '../../components/classrooms/RegenerateCodeModal';
import { BlockStudentModal } from '../../components/classrooms/BlockStudentModal';

import { Users, Clock, BookOpen, AlertCircle, Save, Plus } from 'lucide-react';

export const TeacherClassroomPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [blockModalTarget, setBlockModalTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

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

      setEditFormData({
        name: data.classroom.name,
        subjectName: data.classroom.subjectName,
        courseCode: data.classroom.courseCode,
        department: data.classroom.department,
        semester: data.classroom.semester,
        section: data.classroom.section,
        roomNumber: data.classroom.roomNumber || '',
        description: data.classroom.description || '',
        attendanceThreshold: data.classroom.attendanceThreshold || 75,
        maximumStudents: data.classroom.maximumStudents || '',
        allowStudentLeave: data.classroom.allowStudentLeave || false,
      });

      // Also fetch student roster
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to load classroom workspace details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await enrollmentService.getClassroomStudents(classId, { status: 'all' });
      setStudents(res.data.items || []);
    } catch (err) {
      // Ignore non-fatal error
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAnnouncements(classId);
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      // Ignore
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await scheduleService.getSchedules(classId);
      setSchedules(res.data.schedules || []);
    } catch (err) {
      // Ignore
    }
  };

  // Classroom Action Handlers
  const handleUpdateClassroom = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await classroomService.updateClassroom(classId, editFormData);
      setIsEditing(false);
      await fetchClassroomData();
    } catch (err) {
      alert(err.message || 'Failed to update classroom.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveConfirm = async () => {
    setActionLoading(true);
    try {
      await classroomService.archiveClassroom(classId);
      setArchiveModalOpen(false);
      await fetchClassroomData();
    } catch (err) {
      alert(err.message || 'Failed to archive classroom.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreConfirm = async () => {
    setActionLoading(true);
    try {
      await classroomService.restoreClassroom(classId);
      await fetchClassroomData();
    } catch (err) {
      alert(err.message || 'Failed to restore classroom.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateConfirm = async () => {
    setActionLoading(true);
    try {
      await classroomService.regenerateJoinCode(classId);
      setRegenerateModalOpen(false);
      await fetchClassroomData();
    } catch (err) {
      alert(err.message || 'Failed to regenerate code.');
    } finally {
      setActionLoading(false);
    }
  };

  // Student Roster Handlers
  const handleRemoveStudent = async (item) => {
    if (!window.confirm(`Remove ${item.studentId?.name || 'this student'} from classroom?`)) return;
    try {
      await enrollmentService.removeStudent(classId, item.studentId._id);
      await fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to remove student.');
    }
  };

  const handleBlockConfirm = async (reason) => {
    if (!blockModalTarget) return;
    setActionLoading(true);
    try {
      await enrollmentService.blockStudent(classId, blockModalTarget.studentId._id, reason);
      setBlockModalTarget(null);
      await fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to block student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockStudent = async (item) => {
    try {
      await enrollmentService.unblockStudent(classId, item.studentId._id);
      await fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to unblock student.');
    }
  };

  // Announcement Handlers
  const handleCreateAnnouncement = async (announcementData) => {
    try {
      await announcementService.createAnnouncement(classId, announcementData);
      await fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to post announcement.');
    }
  };

  const handlePublishAnnouncement = async (item) => {
    try {
      await announcementService.publishAnnouncement(item._id);
      await fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to publish announcement.');
    }
  };

  const handleArchiveAnnouncement = async (item) => {
    try {
      await announcementService.archiveAnnouncement(item._id);
      await fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to archive announcement.');
    }
  };

  // Schedule Save Handler
  const handleSaveSchedules = async (newSchedules) => {
    // Delete existing & recreate for simple sync
    try {
      for (const s of schedules) {
        if (s._id) await scheduleService.deleteSchedule(classId, s._id);
      }
      for (const s of newSchedules) {
        await scheduleService.createSchedule(classId, s);
      }
      await fetchSchedules();
      alert('Schedules saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update schedule.');
    }
  };

  if (loading) return <div className="loading-state-center">Loading classroom workspace...</div>;
  if (error) return <div className="alert alert-error m-4">{error}</div>;
  if (!classroom) return null;

  return (
    <div className="classroom-workspace-page">
      <ClassroomHeader
        classroom={classroom}
        isTeacher={true}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEdit={() => setIsEditing(!isEditing)}
        onArchive={() => setArchiveModalOpen(true)}
        onRestore={handleRestoreConfirm}
        onRegenerateCode={() => setRegenerateModalOpen(true)}
      />

      {/* Edit Form Drawer */}
      {isEditing && (
        <div className="card edit-form-card mb-4">
          <h3>Edit Classroom Details</h3>
          <form onSubmit={handleUpdateClassroom}>
            <div className="grid-2-col">
              <div className="input-group">
                <label>Class Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="input-control"
                  required
                />
              </div>
              <div className="input-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={editFormData.subjectName}
                  onChange={(e) => setEditFormData({ ...editFormData, subjectName: e.target.value })}
                  className="input-control"
                  required
                />
              </div>
            </div>

            <div className="grid-3-col">
              <div className="input-group">
                <label>Course Code</label>
                <input
                  type="text"
                  value={editFormData.courseCode}
                  onChange={(e) => setEditFormData({ ...editFormData, courseCode: e.target.value.toUpperCase() })}
                  className="input-control"
                  required
                />
              </div>
              <div className="input-group">
                <label>Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="input-control"
                  required
                />
              </div>
              <div className="input-group">
                <label>Room Number</label>
                <input
                  type="text"
                  value={editFormData.roomNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, roomNumber: e.target.value })}
                  className="input-control"
                />
              </div>
            </div>

            <div className="btn-group-row">
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                <Save size={14} /> Save Changes
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Panels */}
      <div className="workspace-tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab-grid">
            <div className="left-col">
              {/* Join Code Card */}
              <JoinCodeCard
                joinCode={classroom.joinCode}
                onRegenerate={() => setRegenerateModalOpen(true)}
              />

              {/* Weekly Schedule Preview */}
              <div className="card workspace-card">
                <h3>Weekly Lecture Schedule</h3>
                <ScheduleList schedules={schedules} />
              </div>
            </div>

            <div className="right-col">
              {/* Quick Roster Summary */}
              <div className="card workspace-card">
                <div className="card-title-row">
                  <h3>Enrolled Students ({students.filter((s) => s.status === 'active').length})</h3>
                  <button onClick={() => setActiveTab('students')} className="btn-text-link">
                    View Full Roster
                  </button>
                </div>
                <div className="roster-preview-list">
                  {students.filter((s) => s.status === 'active').slice(0, 5).map((item) => (
                    <div key={item._id} className="preview-student-item">
                      <div className="avatar-xs">
                        {(item.studentId?.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <span>{item.studentId?.name}</span>
                      <span className="roll-tag">{item.studentProfile?.rollNumber || 'N/A'}</span>
                    </div>
                  ))}
                  {students.filter((s) => s.status === 'active').length === 0 && (
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>No students enrolled yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Announcements */}
              <div className="card workspace-card">
                <div className="card-title-row">
                  <h3>Announcements ({announcements.length})</h3>
                  <button onClick={() => setActiveTab('announcements')} className="btn-text-link">
                    Post Announcement
                  </button>
                </div>

                <div className="announcements-preview-list">
                  {announcements.slice(0, 2).map((a) => (
                    <AnnouncementCard
                      key={a._id}
                      announcement={a}
                      isTeacher={true}
                      onPublish={handlePublishAnnouncement}
                      onArchive={handleArchiveAnnouncement}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <StudentRoster
            students={students}
            onRemove={handleRemoveStudent}
            onBlock={(item) => setBlockModalTarget(item)}
            onUnblock={handleUnblockStudent}
          />
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-workspace-wrapper">
            <ScheduleEditor schedules={schedules} onChange={handleSaveSchedules} />
            <div className="mt-4">
              <ScheduleList schedules={schedules} />
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="announcements-workspace-wrapper">
            <AnnouncementComposer
              onPublish={handleCreateAnnouncement}
              onSaveDraft={handleCreateAnnouncement}
            />
            <div className="announcements-list-wrapper mt-4">
              {announcements.map((a) => (
                <AnnouncementCard
                  key={a._id}
                  announcement={a}
                  isTeacher={true}
                  onPublish={handlePublishAnnouncement}
                  onArchive={handleArchiveAnnouncement}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {archiveModalOpen && (
        <ArchiveClassroomModal
          classroom={classroom}
          onConfirm={handleArchiveConfirm}
          onClose={() => setArchiveModalOpen(false)}
          loading={actionLoading}
        />
      )}

      {regenerateModalOpen && (
        <RegenerateCodeModal
          classroom={classroom}
          onConfirm={handleRegenerateConfirm}
          onClose={() => setRegenerateModalOpen(false)}
          loading={actionLoading}
        />
      )}

      {blockModalTarget && (
        <BlockStudentModal
          enrollmentItem={blockModalTarget}
          onConfirm={handleBlockConfirm}
          onClose={() => setBlockModalTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default TeacherClassroomPage;
