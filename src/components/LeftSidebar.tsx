'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Tooltip from './Tooltip';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
  { href: '/recipes', icon: DocumentTextIcon, label: 'Recipes' },
  { href: '/meal-plan', icon: CalendarIcon, label: 'Meal Plan' },
  { href: '/shopping-list', icon: ShoppingCartIcon, label: 'Shopping List' },
];

export default function LeftSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-[50px]' : 'w-64'
    }`}>
      <div className={`p-4 ${isCollapsed ? 'flex justify-center' : 'flex items-center justify-between'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold">PrepWise</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Tooltip text={item.label}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-black' : 'text-gray-600'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-4 space-y-4">
        {/* User Info */}
        {user && !isCollapsed && (
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600">
              <p className="font-medium">{user.name || user.email}</p>
              <p className="text-xs text-gray-500">
                {user.roles.join(', ')}
              </p>
            </div>
          </div>
        )}
        
        {/* Logout Button */}
        <Tooltip text={isLoggingOut ? "Logging out..." : "Logout"}>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isCollapsed ? 'flex justify-center' : ''
            }`}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            ) : (
              isLoggingOut ? 'Logging out...' : 'Logout'
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}