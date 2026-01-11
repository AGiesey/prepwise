'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface UserWidgetProps {
  isCollapsed?: boolean;
}

export default function UserWidget({ isCollapsed = false }: UserWidgetProps) {
  const { user, isLoading } = useUser();

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  if (isLoading) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  } else (
    console.log("USER", user)
  )

  const displayName = user.name || user.email || 'User';

  return (
    <div className="p-4 border-t border-gray-200">
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
            {displayName.charAt(0).toUpperCase()}
          </div>
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
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
