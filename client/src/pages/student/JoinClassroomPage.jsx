import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import enrollmentService from '../../services/enrollmentService';
import { Key, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const JoinClassroomPage = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinedClass, setJoinedClass] = useState(null);

  const handleInputChange = (e) => {
    // Automatically uppercase and trim spaces
    const val = e.target.value.toUpperCase().replace(/\s+/g, '');
    setJoinCode(val);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!joinCode || joinCode.length < 4) {
      setError('Please enter a valid 6-character class code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await enrollmentService.joinClassroom(joinCode);
      const classroom = res.data.classroom;
      setJoinedClass(classroom);
      setTimeout(() => {
        navigate(`/student/classes/${classroom._id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to join classroom. Please check class code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-classroom-page">
      <div className="page-header-row mb-4">
        <Link to="/student/classes" className="back-link">
          <ArrowLeft size={16} /> Back to My Classes
        </Link>
      </div>

      <div className="card join-card-box">
        <div className="join-card-header">
          <div className="icon-badge-sage">
            <Key size={26} />
          </div>
          <h2>Join a Classroom</h2>
          <p>Ask your teacher for the 6-character class code and enter it below</p>
        </div>

        {joinedClass ? (
          <div className="alert alert-success text-center">
            <CheckCircle2 size={24} style={{ margin: '0 auto 0.5rem auto' }} />
            <p><b>Successfully Joined!</b></p>
            <p style={{ fontSize: '0.9rem' }}>
              Enrolled in <b>{joinedClass.name}</b> ({joinedClass.courseCode}). Redirecting to workspace...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error mb-4">{error}</div>}

            <div className="input-group">
              <label>Class Code</label>
              <input
                type="text"
                placeholder="e.g. K7M4QX"
                value={joinCode}
                onChange={handleInputChange}
                className="input-control code-input-large"
                maxLength={10}
                required
                autoFocus
              />
            </div>

            <div className="join-info-box">
              <ShieldCheck size={16} />
              <span>
                Class codes are verified on the backend. Only active classrooms with available capacity can be joined.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-4"
              disabled={loading || joinCode.length < 4}
            >
              {loading ? 'Verifying Code...' : 'Join Classroom'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinClassroomPage;
