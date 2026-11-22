import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, AuthResponse, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName: string, role: Role) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('expiryguard_token');
    const savedUser = localStorage.getItem('expiryguard_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('expiryguard_token');
        localStorage.removeItem('expiryguard_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { username, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('expiryguard_token', receivedToken);
    localStorage.setItem('expiryguard_user', JSON.stringify(receivedUser));
  };

  const register = async (username: string, password: string, fullName: string, role: Role) => {
    const response = await api.post<AuthResponse>('/auth/register', { username, password, fullName, role });
    const { token: receivedToken, user: receivedUser } = response.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('expiryguard_token', receivedToken);
    localStorage.setItem('expiryguard_user', JSON.stringify(receivedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('expiryguard_token');
    localStorage.removeItem('expiryguard_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, isLoading }}>
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
