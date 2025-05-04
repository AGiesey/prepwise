'use client';

import { useChat } from './ChatContainer';

interface MainContentWrapperProps {
  children: React.ReactNode;
}

export default function MainContentWrapper({ children }: MainContentWrapperProps) {
  const { isOpen } = useChat();

  return (
    <main className="flex-1 overflow-auto bg-white">
      {children}
    </main>
  );
} 