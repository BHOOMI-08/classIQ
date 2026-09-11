import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import classroomService from '../../services/classroomService';
import { ScheduleEditor } from '../../components/classrooms/ScheduleEditor';
import { BookOpen, ArrowLeft, Check, Sparkles } from 'lucide-react';

export const CreateClassroomPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    subjectName: '',
    courseCode: '',
    department: '',
    semester: '1',
    section: 'A',
    roomNumber: '',
    description: '',
    institution: 'Computer Science Department',
    attendanceThreshold: 75,
    maximumStudents: '',
    allowStudentLeave: false,
    schedules: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        maximumStudents: formData.maximumStudents ? parseInt(formData.maximumStudents, 10) : null,
      };

      const res = await classroomService.createClassroom(payload);
      const newClass = res.data.classroom;
      navigate(`/teacher/classes/${newClass._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create classroom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-classroom-page">
      <div className="page-header-row">
        <Link to="/teacher/classes" className="back-link">
          <ArrowLeft size={16} /> Back to Classrooms
        </Link>
      </div>

      <div className="form-card-container">
        <div className="form-header-bar">
          <div className="icon-badge">
            <BookOpen size={24} />
          </div>
          <div>
            <h2>Create New Classroom</h2>
            <p>Set up classroom identity, academic details, settings, and lecture schedule</p>
          </div>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="form-section">
            <h3 className="section-title">1. Basic Information</h3>
            <div className="grid-2-col">
              <div className="input-group">
                <label>Classroom Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Data Structures & Algorithms"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input-control"
                  required
                />
              </div>

              <div className="input-group">
                <label>Subject Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures"
                  value={formData.subjectName}
                  onChange={(e) => handleChange('subjectName', e.target.value)}
                  className="input-control"
                  required
                />
              </div>
            </div>

            <div className="grid-2-col">
              <div className="input-group">
                <label>Course Code <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. CS-301"
                  value={formData.courseCode}
                  onChange={(e) => handleChange('courseCode', e.target.value.toUpperCase())}
                  className="input-control uppercase"
                  required
                />
              </div>

              <div className="input-group">
                <label>Institution / University</label>
                <input
                  type="text"
                  placeholder="e.g. Department of Computer Science"
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  className="input-control"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Classroom Description (Optional)</label>
              <textarea
                placeholder="Brief course objectives, syllabus outline, or room guidelines..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input-control"
                rows={3}
              />
            </div>
          </div>

          {/* Section 2: Academic Details */}
          <div className="form-section">
            <h3 className="section-title">2. Academic Details</h3>
            <div className="grid-3-col">
              <div className="input-group">
                <label>Department <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="input-control"
                  required
                />
              </div>

              <div className="input-group">
                <label>Semester <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. 5"
                  value={formData.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  className="input-control"
                  required
                />
              </div>

              <div className="input-group">
                <label>Section <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. A"
                  value={formData.section}
                  onChange={(e) => handleChange('section', e.target.value)}
                  className="input-control"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Classroom Settings */}
          <div className="form-section">
            <h3 className="section-title">3. Classroom Settings</h3>
            <div className="grid-3-col">
              <div className="input-group">
                <label>Room Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Lab 302"
                  value={formData.roomNumber}
                  onChange={(e) => handleChange('roomNumber', e.target.value)}
                  className="input-control"
                />
              </div>

              <div className="input-group">
                <label>Attendance Threshold (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendanceThreshold}
                  onChange={(e) => handleChange('attendanceThreshold', parseInt(e.target.value, 10) || 75)}
                  className="input-control"
                />
              </div>

              <div className="input-group">
                <label>Max Students (Leave blank for unlimited)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formData.maximumStudents}
                  onChange={(e) => handleChange('maximumStudents', e.target.value)}
                  className="input-control"
                />
              </div>
            </div>

            <div className="checkbox-row mt-2">
              <input
                type="checkbox"
                id="allowStudentLeave"
                checked={formData.allowStudentLeave}
                onChange={(e) => handleChange('allowStudentLeave', e.target.checked)}
              />
              <label htmlFor="allowStudentLeave">
                Allow students to leave classroom independently without teacher approval
              </label>
            </div>
          </div>

          {/* Section 4: Weekly Schedule */}
          <div className="form-section">
            <ScheduleEditor
              schedules={formData.schedules}
              onChange={(schedules) => handleChange('schedules', schedules)}
            />
          </div>

          {/* Form Actions */}
          <div className="form-actions-bar">
            <Link to="/teacher/classes" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Classroom...' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassroomPage;
