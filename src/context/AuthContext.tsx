import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string, role?: 'admin' | 'member') => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session (works for both LocalApi and HttpApi)
  useEffect(() => {
    api.getCurrentUser()
      .then(session => setUser(session))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const loggedUser = await api.login(email, password);
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password?: string, role: 'admin' | 'member' = 'member') => {
    setLoading(true);
    try {
      const newUser = await api.signup(name, email, role, password);
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const refreshUser = () => {
    api.getCurrentUser()
      .then(session => setUser(session))
      .catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
