'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ChatSidebar({ isOpen, onClose, children }: ChatSidebarProps) {
  const [width, setWidth] = useState(320); // Default width in pixels
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const startDragging = (e: React.MouseEvent) => {
    if (!isOpen) return;
    setIsDragging(true);
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.classList.add('cursor-ew-resize');
    e.preventDefault();
  };

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('cursor-ew-resize');
  }, []);

  const onDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !isOpen) return;
    
    const deltaX = startX.current - e.clientX;
    const newWidth = startWidth.current + deltaX;
    const maxWidth = window.innerWidth * 0.5;
    const minWidth = 320; // Current default width
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
    }
  }, [isDragging, isOpen, startX, startWidth]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDragging);
      return () => {
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDragging);
        document.body.classList.remove('cursor-ew-resize');
      };
    }
  }, [isDragging, isOpen, onDrag, stopDragging]);

  return (
    <aside 
      ref={sidebarRef}
      className={`bg-white border-l-2 border-gray-200 shadow-[-4px_0_8px_rgba(0,0,0,0.1)] transition-all duration-300 relative ${
        isOpen ? 'w-80' : 'w-0'
      }`}
      style={{ width: isOpen ? `${width}px` : '0' }}
    >
      <div 
        className={`absolute -left-1 top-0 bottom-0 w-1 cursor-ew-resize ${
          isOpen ? 'block' : 'hidden'
        }`}
        onMouseDown={startDragging}
      />
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