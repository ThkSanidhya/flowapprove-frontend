import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthProvider init - Token exists:', !!token);
    console.log('AuthProvider init - Stored user:', storedUser);
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify token
      api.get('/auth/me').catch(() => {
        console.log('Token invalid, logging out');
        logout();
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('Login function called with:', { email, password: '***' });
    
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return response.data;
    } catch (error) {
      console.error('Login API error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    console.log('Register function called with:', userData);
    
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Register response:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return response.data;
    } catch (error) {
      console.error('Register API error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};