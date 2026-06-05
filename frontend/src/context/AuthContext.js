import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE = 'http://localhost:5000/api';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('attendx_token'));
  const [loading, setLoading] = useState(true);

  // Attach token to every axios request
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('attendx_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('attendx_token');
    }
  }, [token]);

  // On mount, verify stored token
  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await axios.get(`${BASE}/auth/me`);
        setUser(res.data.user);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line

  const register = useCallback(async (name, email, password) => {
    const res = await axios.post(`${BASE}/auth/register`, { name, email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${BASE}/auth/login`, { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await axios.post(`${BASE}/auth/logout`); } catch {}
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
