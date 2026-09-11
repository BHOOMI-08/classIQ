import React, { useEffect, useState } from 'react';
import profileService from '../services/profileService';
import { Laptop, Smartphone, Globe, ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';

export const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await profileService.getSessions();
      setSessions(res.data);
    } catch (err) {
      setError('Failed to fetch active device sessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSingle = async (sessionId) => {
    try {
      await profileService.revokeSession(sessionId);
      setMsg('Device session revoked successfully.');
      await fetchSessions();
    } catch (err) {
      setError('Failed to revoke session.');
    }
  };

  const handleRevokeOthers = async () => {
    try {
      const res = await profileService.revokeOtherSessions();
      setMsg(res.message);
      await fetchSessions();
    } catch (err) {
      setError('Failed to revoke other sessions.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading active sessions...</div>;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#24312C' }}>Active Device Sessions</h1>
          <p style={{ color: '#68736E', fontSize: '0.9rem' }}>
            Monitor and manage devices logged into your ClassIQ account
          </p>
        </div>

        {sessions.filter((s) => !s.isCurrentSession).length > 0 && (
          <button onClick={handleRevokeOthers} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <ShieldAlert size={16} color="#C95C5C" /> Revoke All Other Devices
          </button>
        )}
      </div>

      {msg && <div className="alert alert-success"><CheckCircle2 size={18} /> {msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderLeft: sess.isCurrentSession ? '4px solid #315C45' : '1px solid #E3DED4'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: sess.isCurrentSession ? '#DCE8DF' : '#F5F3EB',
                color: sess.isCurrentSession ? '#315C45' : '#68736E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {sess.deviceType === 'mobile' ? <Smartphone size={22} /> : <Laptop size={22} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#24312C' }}>
                    {sess.browser} on {sess.operatingSystem}
                  </h4>
                  {sess.isCurrentSession && (
                    <span className="badge" style={{ backgroundColor: '#DCE8DF', color: '#315C45' }}>
                      Current Device
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.85rem', color: '#68736E' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Globe size={14} /> IP: {sess.ipAddress}
                  </span>
                  <span>
                    Last active: {new Date(sess.lastActiveAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {!sess.isCurrentSession && (
              <button
                onClick={() => handleRevokeSingle(sess.id)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: '#C95C5C', borderColor: '#f8b4b4' }}
              >
                <Trash2 size={16} /> Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
