import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Laptop, Settings, GraduationCap, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'teacher') return '/teacher/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const getClassroomsPath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/classes';
    if (user.role === 'teacher') return '/teacher/classes';
    return '/';
  };

  return (
    <nav className="app-top-navbar">
      <Link to={getDashboardPath()} className="navbar-brand-link">
        <div className="brand-icon">
          <GraduationCap size={22} />
        </div>
        <span className="brand-text">
          Class<span className="brand-highlight">IQ</span>
        </span>
      </Link>

      <div className="navbar-right-menu">
        {user ? (
          <>
            <Link to={getDashboardPath()} className="nav-link">
              Dashboard
            </Link>

            {(user.role === 'teacher' || user.role === 'student') && (
              <Link to={getClassroomsPath()} className="nav-link">
                <BookOpen size={16} /> {user.role === 'teacher' ? 'Classrooms' : 'My Classes'}
              </Link>
            )}

            <div className="user-profile-controls">
              <Link to="/profile" title="Profile" className="user-name-link">
                <User size={18} />
                <span>{user.name}</span>
              </Link>

              <Link to="/profile/sessions" title="Active Sessions" className="icon-link">
                <Laptop size={18} />
              </Link>

              <Link to="/profile/security" title="Security" className="icon-link">
                <Shield size={18} />
              </Link>

              <Link to="/settings" title="Settings" className="icon-link">
                <Settings size={18} />
              </Link>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </>
        ) : (
          <div className="auth-btn-group">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
