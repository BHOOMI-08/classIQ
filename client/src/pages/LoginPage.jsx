import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck, ArrowRight, Eye, EyeOff, ArrowLeft, GraduationCap } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated user away from login page
  useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard', { replace: true });
      else if (user.role === 'teacher') navigate('/teacher/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password, rememberDevice);
      if (userData.role === 'student') navigate('/student/dashboard');
      else if (userData.role === 'teacher') navigate('/teacher/dashboard');
      else if (userData.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || err.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Top Header Bar */}
      <div className="auth-header-bar">
        <Link to="/" className="landing-brand-logo">
          <div className="brand-icon-box">
            <GraduationCap size={22} />
          </div>
          <span className="brand-wordmark">
            Class<span className="brand-highlight">IQ</span>
          </span>
        </Link>
        <Link to="/" className="btn btn-secondary btn-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="auth-card-wrapper">
        <div className="card auth-card">
          <div className="auth-card-header">
            <div className="auth-icon-badge">
              <ShieldCheck size={28} />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your ClassIQ account</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-field-icon" />
                <input
                  type="email"
                  className="input-control with-icon"
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                <Link to="/forgot-password" className="text-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-control with-icon pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="checkbox-row">
              <input
                type="checkbox"
                id="remember"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
              />
              <label htmlFor="remember">Remember this device</label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer-link">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary">
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
