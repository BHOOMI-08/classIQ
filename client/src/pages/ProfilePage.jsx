import React, { useState, useEffect } from 'react';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { User, Upload, Trash2, Save, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUserData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Editable fields
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    semester: '',
    section: '',
    designation: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileService.getProfile();
      const data = res.data;
      setProfile(data);
      setFormData({
        name: data.user.name || '',
        department: data.profile?.department || '',
        semester: data.profile?.semester || '',
        section: data.profile?.section || '',
        designation: data.profile?.designation || '',
        bio: data.profile?.bio || '',
      });
    } catch (err) {
      setError('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    try {
      await profileService.updateProfile(formData);
      setMsg('Profile updated successfully!');
      await refreshUserData();
      await fetchProfile();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    try {
      await profileService.uploadAvatar(data);
      setMsg('Avatar updated!');
      await refreshUserData();
      await fetchProfile();
    } catch (err) {
      setError(err.message || 'Avatar upload failed');
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await profileService.deleteAvatar();
      setMsg('Avatar removed');
      await refreshUserData();
      await fetchProfile();
    } catch (err) {
      setError('Failed to remove avatar');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#24312C', marginBottom: '0.25rem' }}>
        Account Profile
      </h1>
      <p style={{ color: '#68736E', marginBottom: '1.5rem' }}>Manage your personal details and academic credentials</p>

      {msg && <div className="alert alert-success"><CheckCircle2 size={18} /> {msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
        {/* Left Column: Avatar & Role Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              backgroundColor: '#DCE8DF',
              color: '#315C45',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: '700',
              overflow: 'hidden',
              margin: '0 auto',
              border: '3px solid #FCFBF7',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {profile?.user?.avatarUrl ? (
                <img src={profile.user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile?.user?.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <label className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', cursor: 'pointer' }}>
              <Upload size={14} /> Upload
              <input type="file" onChange={handleAvatarUpload} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} />
            </label>
            {profile?.user?.avatarUrl && (
              <button onClick={handleAvatarDelete} className="btn btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{profile?.user?.name}</h3>
          <p style={{ color: '#68736E', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{profile?.user?.email}</p>

          <span className={`badge badge-${user.role}`}>
            {user.role}
          </span>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: '#24312C' }}>
            Personal Details
          </h3>

          <form onSubmit={handleUpdate}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                className="input-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Department</label>
              <input
                type="text"
                className="input-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            {user.role === 'student' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Semester</label>
                  <input
                    type="text"
                    className="input-control"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Section</label>
                  <input
                    type="text"
                    className="input-control"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="input-group">
                <label>Designation</label>
                <input
                  type="text"
                  className="input-control"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
            )}

            <div className="input-group">
              <label>Academic Bio</label>
              <textarea
                className="input-control"
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Short description..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '0.5rem' }}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
