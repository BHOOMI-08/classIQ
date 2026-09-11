import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: '#315C45',
        fontWeight: '600'
      }}>
        Authenticating ClassIQ session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Role unauthorized
    const redirectPath =
      user.role === 'student'
        ? '/student/dashboard'
        : user.role === 'teacher'
        ? '/teacher/dashboard'
        : '/admin/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
