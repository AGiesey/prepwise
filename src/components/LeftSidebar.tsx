'use client';

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
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white text-black border-r-2 border-gray-200 shadow-[4px_0_8px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b-2 border-gray-200">
          <h1 className="text-xl font-bold">PrepWise</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <a 
                    href={item.href}
                    className={`flex items-center p-2 rounded text-black transition-all duration-200 ${
                      isActive 
                        ? 'bg-gray-100 font-semibold border-l-4 border-black' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-black' : 'text-gray-600'}`} />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}