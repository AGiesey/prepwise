'use client';

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
import UserWidget from './widgets/UserWidget';

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
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-[50px]' : 'w-64'
    }`}>
      <div className={`p-4 ${isCollapsed ? 'flex justify-center' : 'flex items-center justify-between'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold">PrepWise</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
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

      <UserWidget isCollapsed={isCollapsed} />
    </div>
  );
}