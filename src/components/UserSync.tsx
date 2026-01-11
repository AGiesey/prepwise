'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useRef } from 'react';
import { useDatabaseUser } from '@/utilities/useUser';

/**
 * Component that automatically syncs the Auth0 user to the database
 * after login. This ensures the user exists in our database.
 * Only syncs once per user session to avoid unnecessary API calls.
 */
export default function UserSync() {
  const { user, isLoading } = useUser();
  const { refreshUser } = useDatabaseUser();
  const hasSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    // Only sync if user is authenticated, not loading, and we haven't synced this user yet
    if (!isLoading && user?.sub && hasSyncedRef.current !== user.sub) {
      // Mark this user as synced
      hasSyncedRef.current = user.sub;
      
      // Call the /api/auth/me endpoint which will sync the user
      fetch('/api/auth/me')
        .then(async (response) => {
          if (response.ok) {
            const dbUser = await response.json();
            console.log('User successfully synced to database:', dbUser);
            // Refresh the user context
            await refreshUser();
          } else {
            console.error('Failed to sync user to database');
            // Reset on error so we can retry
            hasSyncedRef.current = null;
          }
        })
        .catch((error) => {
          console.error('Error syncing user:', error);
          // Reset on error so we can retry
          hasSyncedRef.current = null;
        });
    }
  }, [user, isLoading, refreshUser]);

  // This component doesn't render anything
  return null;
}
