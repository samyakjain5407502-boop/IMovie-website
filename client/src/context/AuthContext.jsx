import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('imovies_city') || 'Mumbai';
  });

  const changeCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('imovies_city', city);
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('imovies_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.token) {
          setUser(parsed);
          setToken(parsed.token);
        }
      }
    } catch (e) {
      console.error('Failed to parse user session', e);
      localStorage.removeItem('imovies_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('imovies_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await API.post('/auth/register', { name, email, password });
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('imovies_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const sendOtp = async (identifier) => {
    try {
      const res = await API.post('/auth/send-otp', { identifier });
      return {
        success: true,
        otp: res.data.otp,
        message: res.data.message,
        identifier: res.data.identifier,
        deliveryMethod: res.data.deliveryMethod,
        deliveryInfo: res.data.deliveryInfo,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.message === 'Network Error'
          ? 'Backend server connecting... Please try again in a few seconds.'
          : error.message) ||
        'Failed to send OTP. Please check mobile/email.';
      return { success: false, message };
    }
  };

  const verifyOtp = async (identifier, otp) => {
    try {
      const res = await API.post('/auth/verify-otp', { identifier, otp });
      const userData = res.data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('imovies_user', JSON.stringify(userData));
      return { success: true, user: userData, message: res.data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('imovies_user');
  };

  // Quick Demo Login helper for 1-click user testing
  const quickDemoLogin = async () => {
    return await login('demo@imovies.com', 'password123');
  };

  // Quick Admin Login helper for 1-click admin testing
  const quickAdminLogin = async () => {
    return await login('admin@imovies.com', 'admin123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        loading,
        selectedCity,
        changeCity,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        quickDemoLogin,
        quickAdminLogin,
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
