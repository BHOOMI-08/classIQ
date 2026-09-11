import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Building, Users, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div style={{
        backgroundColor: '#FCFBF7',
        border: '1px solid #E3DED4',
        borderRadius: '16px',
        padding: '1.75rem',
        marginBottom: '1.75rem'
      }}>
        <span className="badge badge-admin" style={{ marginBottom: '0.5rem' }}>Institution Administration</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#24312C' }}>Admin Control Panel</h1>
        <p style={{ color: '#68736E', fontSize: '0.95rem' }}>Institution-wide user roles, attendance policies, and platform security auditing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <Building size={24} color="#315C45" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.85rem', color: '#68736E' }}>Total Departments</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>8 Departments</div>
        </div>

        <div className="card">
          <Users size={24} color="#315C45" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.85rem', color: '#68736E' }}>Registered Users</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>1,240 Users</div>
        </div>

        <div className="card">
          <Activity size={24} color="#315C45" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.85rem', color: '#68736E' }}>System Health</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#3F8F63' }}>Operational</div>
        </div>
      </div>
    </div>
  );
};
