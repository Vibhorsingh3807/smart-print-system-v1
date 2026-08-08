import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../lib/axios.js';
import { getAdminSocket } from '../lib/socket.js';

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
      const token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.data.user.role === 'ADMIN') {
            setUser(res.data.data.user);
            const socket = getAdminSocket();
            socket.connect();
            socket.emit('join:admin');
          } else {
            sessionStorage.clear();
            localStorage.clear();
          }
        } catch (_err) {
          sessionStorage.clear();
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleUnload = () => {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminRefreshToken');
    };

    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, []);

  const login = (token: string, refreshToken: string, userData: User) => {
    sessionStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminRefreshToken', refreshToken);
    setUser(userData);
    const socket = getAdminSocket();
    socket.connect();
    socket.emit('join:admin');
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setUser(null);
    const socket = getAdminSocket();
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
