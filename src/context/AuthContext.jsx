import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser as apiLoginUser,
  loginStudent as apiLoginStudent,
  loginTeacher as apiLoginTeacher,
  registerStudent as apiRegisterStudent,
  getCurrentUser,
  logoutUser
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tuf_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('tuf_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('tuf_token');
      if (savedToken) {
        try {
          const res = await getCurrentUser();
          setUser(res.data);
          localStorage.setItem('tuf_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed:", err);
          localStorage.removeItem('tuf_token');
          localStorage.removeItem('tuf_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const res = await apiLoginUser({ email, password, remember_me: rememberMe });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('tuf_token', access_token);
    localStorage.setItem('tuf_user', JSON.stringify(userData));
    return userData;
  };

  const loginStudent = async (email, password, rememberMe = false) => {
    const res = await apiLoginStudent({ email, password, remember_me: rememberMe });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('tuf_token', access_token);
    localStorage.setItem('tuf_user', JSON.stringify(userData));
    return userData;
  };

  const loginTeacher = async (email, password, rememberMe = false) => {
    const res = await apiLoginTeacher({ email, password, remember_me: rememberMe });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('tuf_token', access_token);
    localStorage.setItem('tuf_user', JSON.stringify(userData));
    return userData;
  };

  const registerStudent = async (data) => {
    const res = await apiRegisterStudent(data);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('tuf_token', access_token);
    localStorage.setItem('tuf_user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('tuf_token');
      localStorage.removeItem('tuf_user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('tuf_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    login,
    loginStudent,
    loginTeacher,
    registerStudent,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
