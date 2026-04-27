import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import apiClient from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const businessSignup = async (data) => {
    try {
      setError(null);
      const response = await authService.businessSignup(data);
      if (response?.accessToken && response?.user) {
        setToken(response.accessToken);
        setUser(response.user);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (err) {
      const errorMsg = err.message || 'Signup failed';
      setError(errorMsg);
      throw err;
    }
  };

  const recyclerSignup = async (data) => {
    try {
      setError(null);
      const response = await authService.recyclerSignup(data);
      if (response?.accessToken && response?.user) {
        setToken(response.accessToken);
        setUser(response.user);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (err) {
      const errorMsg = err.message || 'Signup failed';
      setError(errorMsg);
      throw err;
    }
  };

  const businessLogin = async (email, password) => {
    try {
      setError(null);
      const response = await authService.businessLogin(email, password);
      if (response?.accessToken && response?.user) {
        setToken(response.accessToken);
        setUser(response.user);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  const recyclerLogin = async (email, password) => {
    try {
      setError(null);
      const response = await authService.recyclerLogin(email, password);
      if (response?.accessToken && response?.user) {
        setToken(response.accessToken);
        setUser(response.user);
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // âœ… Call backend logout endpoint to blacklist token
      if (token) {
        try {
          await apiClient.post('/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          // If logout endpoint fails, still clear client state
        }
      }

      // âœ… Clear all local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      setUser(null);
      setToken(null);
      setError(null);
    } catch (error) {
      // Still clear state even if error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await authService.updateProfile(data);
      if (response?.user || response?.id) {
        const userData = response.user || response;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return response;
    } catch (err) {
      const errorMsg = err.message || 'Update failed';
      setError(errorMsg);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    businessSignup,
    recyclerSignup,
    businessLogin,
    recyclerLogin,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

