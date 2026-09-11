import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { KeyRound, Mail, CheckCircle2, Lock } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setMsg(res.message);
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <KeyRound size={38} color="#315C45" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Reset Password</h2>
          <p style={{ color: '#68736E', fontSize: '0.9rem' }}>
            Enter your institutional email to receive a password reset link
          </p>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#929A96' }} />
              <input
                type="email"
                className="input-control"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link to="/login" style={{ fontSize: '0.85rem', color: '#315C45', fontWeight: '600' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Lock size={38} color="#315C45" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Set New Password</h2>
          <p style={{ color: '#68736E', fontSize: '0.9rem' }}>Choose a strong password for your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#3F8F63" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Password Reset Complete</h3>
            <p style={{ color: '#68736E', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your password has been updated. All other active sessions have been logged out for security.
            </p>
            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%' }}>
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                className="input-control"
                placeholder="At least 8 chars (A-Z, a-z, 0-9)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="input-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.75rem' }}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
