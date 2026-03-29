import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, role: decoded.role, team_id: decoded.team_id });       
      } catch (e) {
        logout();
      }
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    setToken(res.data.token);
  };

  const register = async (name, email, password, role, team_name) => {
    const res = await apiClient.post('/auth/register', { name, email, password, role, team_name });
    setToken(res.data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);