'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDatabaseUser } from '@/utilities/useUser';

interface UserWidgetProps {
  isCollapsed?: boolean;
}

export default function UserWidget({ isCollapsed = false }: UserWidgetProps) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const { user: dbUser, isLoading: dbUserLoading } = useDatabaseUser();
  const router = useRouter();

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const isLoading = auth0Loading || dbUserLoading;

  if (isLoading) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!auth0User) {
    return null;
  }

  // Display firstName if user exists and has firstName, otherwise use email
  const displayName = dbUser?.firstName || auth0User.email || 'User';

  return (
    <div className="p-4 border-t border-gray-200">
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleProfileClick}
            className="p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            title="Profile Settings"
          >
            <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-gray-700">
            Hello, <span className="font-semibold">{displayName}</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleProfileClick}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Profile
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
