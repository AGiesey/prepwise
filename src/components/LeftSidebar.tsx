'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

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
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-xl font-bold">PrepWise</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-black' : 'text-gray-600'}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}