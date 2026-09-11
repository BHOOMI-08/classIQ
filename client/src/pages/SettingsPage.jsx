import React, { useState } from 'react';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { Settings, Bell, AlertTriangle, Trash2 } from 'lucide-react';

export const SettingsPage = () => {
  const { logout } = useAuth();
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await profileService.deactivateAccount(passwordConfirm);
      await logout();
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || 'Failed to deactivate account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Settings size={28} color="#315C45" />
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#24312C' }}>Account Settings</h1>
          <p style={{ color: '#68736E', fontSize: '0.9rem' }}>Security alerts and account status controls</p>
        </div>
      </div>

      {/* Security Preferences */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: '#24312C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} color="#315C45" /> Security & Session Notifications
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: '600' }}>New Device Login Email Alerts</div>
              <div style={{ fontSize: '0.85rem', color: '#68736E' }}>Receive an instant email whenever a new device signs in</div>
            </div>
            <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: '600' }}>Password Reset Confirmations</div>
              <div style={{ fontSize: '0.85rem', color: '#68736E' }}>Receive alert emails on password changes or security token resets</div>
            </div>
            <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
          </label>
        </div>
      </div>

      {/* Danger Zone: Account Deactivation */}
      <div className="card" style={{ borderColor: '#f8b4b4', backgroundColor: '#fdf8f8' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', color: '#C95C5C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} /> Deactivate Account
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#68736E', marginBottom: '1.25rem' }}>
          Deactivating your account will instantly revoke all active sessions and disable access. Your academic records remain preserved for administrative retention.
        </p>

        {!deactivateModalOpen ? (
          <button
            onClick={() => setDeactivateModalOpen(true)}
            className="btn btn-danger"
            style={{ padding: '0.6rem 1.2rem' }}
          >
            <Trash2 size={16} /> Deactivate Account
          </button>
        ) : (
          <form onSubmit={handleDeactivate} style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e3ded4' }}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="input-group">
              <label>Confirm Account Password</label>
              <input
                type="password"
                className="input-control"
                placeholder="Enter your current password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeactivateModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={loading}>
                {loading ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
