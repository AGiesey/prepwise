'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const auth = localStorage.getItem('isAuthenticated');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = () => {
    try {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error setting authentication:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('isAuthenticated');
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Error removing authentication:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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