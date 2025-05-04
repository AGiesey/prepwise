'use client';

import { ReactNode } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ChatSidebar({ isOpen, onClose, children }: ChatSidebarProps) {
  return (
    <aside 
      className={`bg-white border-l-2 border-gray-200 shadow-[-4px_0_8px_rgba(0,0,0,0.1)] transition-all duration-300 ${
        isOpen ? 'w-80' : 'w-0'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-black">
            <h2 className="text-lg font-semibold">AI Sous Chef</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-black transition-colors duration-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </aside>
  );
} 