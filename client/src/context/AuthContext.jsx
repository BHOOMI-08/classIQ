import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken } from '../services/api';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial Auth Hydration via Refresh Endpoint
  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const refreshRes = await authService.refresh();
        const token = refreshRes.data.accessToken;
        setAccessToken(token);

        const meRes = await authService.getMe();
        setUser(meRes.data.user);
      } catch (error) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password, rememberDevice = false) => {
    const res = await authService.login(email, password, rememberDevice);
    const { user: userData, accessToken } = res.data;
    setAccessToken(accessToken);
    setUser(userData);
    return userData;
  };

  const registerStudent = async (studentData) => {
    const res = await authService.registerStudent(studentData);
    return res;
  };

  const registerTeacher = async (teacherData) => {
    const res = await authService.registerTeacher(teacherData);
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const refreshUserData = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerStudent,
        registerTeacher,
        logout,
        refreshUserData,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
