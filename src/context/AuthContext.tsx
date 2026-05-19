'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/types';
import { getUserByEmail, getUsers } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('lms_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Initialize data
    getUsers();
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const foundUser = getUserByEmail(email);
    if (!foundUser) {
      return { success: false, message: 'Email tidak ditemukan' };
    }
    if (foundUser.password !== password) {
      return { success: false, message: 'Password salah' };
    }
    setUser(foundUser);
    localStorage.setItem('lms_current_user', JSON.stringify(foundUser));
    return { success: true, message: 'Login berhasil' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
