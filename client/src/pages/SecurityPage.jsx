import React, { useState } from 'react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SecurityPage = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(oldPassword, newPassword);
      setMsg('Password updated successfully. Other active sessions were logged out.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setMsg('');
    setError('');

    try {
      await authService.sendVerificationEmail();
      setMsg('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Shield size={28} color="#315C45" />
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#24312C' }}>Security Settings</h1>
          <p style={{ color: '#68736E', fontSize: '0.9rem' }}>Manage credentials and email verification status</p>
        </div>
      </div>

      {msg && <div className="alert alert-success"><CheckCircle2 size={18} /> {msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Email Verification Status Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
              <Mail size={18} color="#315C45" /> Institutional Email Status
            </div>
            <p style={{ fontSize: '0.85rem', color: '#68736E', marginTop: '0.2rem' }}>
              {user.email}
            </p>
          </div>

          <div>
            {user.isEmailVerified ? (
              <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#3F8F63', border: '1px solid #bbf7d0' }}>
                Verified
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge" style={{ backgroundColor: '#fffbe6', color: '#D49A36', border: '1px solid #ffe58f' }}>
                  Pending Verification
                </span>
                <button
                  onClick={handleResendVerification}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  disabled={resending}
                >
                  {resending ? 'Sending...' : 'Resend Email'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontWeight: '700' }}>
          <KeyRound size={18} color="#315C45" /> Change Account Password
        </div>

        <form onSubmit={handlePasswordChange}>
          <div className="input-group">
            <label>Current Password</label>
            <input
              type="password"
              className="input-control"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              className="input-control"
              placeholder="At least 8 chars (A-Z, a-z, 0-9)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="input-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{
            backgroundColor: '#EEEAF8',
            border: '1px solid #D6CEEA',
            color: '#56458A',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} /> Changing your password will log out all other active device sessions.
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
