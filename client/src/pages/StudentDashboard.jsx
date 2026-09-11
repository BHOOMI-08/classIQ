import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Top Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div>
          <span className="badge badge-student mb-2">Student Workspace</span>
          <h1 className="hero-title">Welcome back, {user?.name}!</h1>
          <p className="hero-sub">Here is your academic attendance, schedule, and course learning summary.</p>
        </div>

        <div className="flex-gap-2">
          <Link to="/student/classes/join" className="btn btn-secondary">
            <LogIn size={18} /> Join Class
          </Link>
          <Link to="/student/classes" className="btn btn-primary">
            <BookOpen size={18} /> My Enrolled Classes
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="dashboard-quick-grid">
        <Link to="/student/classes" className="dash-action-card">
          <div className="card-icon green">
            <BookOpen size={24} />
          </div>
          <div className="card-info">
            <h3>My Enrolled Classes</h3>
            <p>Access lecture notes, announcements & weekly schedules</p>
          </div>
        </Link>

        <Link to="/student/classes/join" className="dash-action-card">
          <div className="card-icon blue">
            <LogIn size={24} />
          </div>
          <div className="card-info">
            <h3>Join a Classroom</h3>
            <p>Enter a 6-character class code to enroll in a new class</p>
          </div>
        </Link>
      </div>

      {/* AI Recommendation Banner */}
      <div className="ai-recommendation-banner mt-4">
        <div className="flex-align-gap">
          <div className="ai-purple-box">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="ai-title">Personalized AI Academic Assistant</div>
            <div className="ai-sub">
              Access 24/7 AI doubt support and course concept summaries inside your enrolled classroom workspace.
            </div>
          </div>
        </div>

        <Link to="/student/classes" className="btn btn-ai">
          Explore Workspaces
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
