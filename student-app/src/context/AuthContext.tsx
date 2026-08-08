import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../lib/axios.js';
import { getSocket } from '../lib/socket.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          const socket = getSocket();
          socket.connect();
          socket.emit('join:user', res.data.data.user.id);
        } catch (_err) {
          sessionStorage.clear();
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Auto logout cleanup on page unload if required
    const handleUnload = () => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
    };

    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, []);

  const login = (token: string, refreshToken: string, userData: User) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    const socket = getSocket();
    socket.connect();
    socket.emit('join:user', userData.id);
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setUser(null);
    const socket = getSocket();
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
