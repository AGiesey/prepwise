'use client';

import React, { useContext, createContext, useState, useEffect, useCallback } from 'react';
import { useUser as useAuth0User } from '@auth0/nextjs-auth0/client';

interface DatabaseUser {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  externalId?: string | null;
  authProvider?: string | null;
  emailVerified: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface UserContextType {
  user: DatabaseUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: auth0User, isLoading: auth0Loading } = useAuth0User();
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!auth0User) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const dbUser = await response.json();
        setUser(dbUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [auth0User]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!auth0Loading) {
      fetchUser();
    }
  }, [auth0User, auth0Loading, fetchUser]);

  return (
    <UserContext.Provider value={{ user, isLoading: isLoading || auth0Loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useDatabaseUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useDatabaseUser must be used within a UserProvider');
  }

  return context;
};
