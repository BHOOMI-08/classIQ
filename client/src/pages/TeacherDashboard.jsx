import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, Users, Sparkles, PlayCircle, Layers } from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Top Welcome Header */}
      <div className="dashboard-hero-banner">
        <div>
          <span className="badge badge-teacher mb-2">Teacher Command Centre</span>
          <h1 className="hero-title">Welcome back, Prof. {user?.name}!</h1>
          <p className="hero-sub">Manage active classrooms, live attendance, schedules, and AI teaching tools.</p>
        </div>

        <div className="flex-gap-2">
          <Link to="/teacher/classes/create" className="btn btn-secondary">
            <Plus size={18} /> New Class
          </Link>
          <Link to="/teacher/classes" className="btn btn-primary">
            <BookOpen size={18} /> Manage Classrooms
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="dashboard-quick-grid">
        <Link to="/teacher/classes" className="dash-action-card">
          <div className="card-icon green">
            <BookOpen size={24} />
          </div>
          <div className="card-info">
            <h3>My Classrooms</h3>
            <p>View classrooms, schedules, and student rosters</p>
          </div>
        </Link>

        <Link to="/teacher/classes/create" className="dash-action-card">
          <div className="card-icon sage">
            <Plus size={24} />
          </div>
          <div className="card-info">
            <h3>Create Classroom</h3>
            <p>Set up a new course, department, section & code</p>
          </div>
        </Link>
      </div>

      {/* AI Quick Tools Section */}
      <div className="card mt-4">
        <h3 className="card-title-ai">
          <Sparkles size={20} color="#7967B2" /> AI Assistant Quick Actions
        </h3>

        <div className="grid-3-col mt-3">
          <div className="ai-tool-box">
            <h4>AI Quiz Generator</h4>
            <p>Generate MCQs & coding questions from lecture notes.</p>
            <button className="btn btn-ai w-full">Generate Quiz</button>
          </div>

          <div className="ai-tool-box">
            <h4>AI Assignment Generator</h4>
            <p>Create structured rubrics & problem sets automatically.</p>
            <button className="btn btn-ai w-full">Create Assignment</button>
          </div>

          <div className="ai-tool-box">
            <h4>Lecture Summary</h4>
            <p>Summarise today's lecture into revision flashcards.</p>
            <button className="btn btn-ai w-full">Generate Summary</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
