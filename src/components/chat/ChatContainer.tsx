'use client';

import { useState, createContext, useContext } from 'react';
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ChatSidebar from './ChatSidebar';
import ChatMessages from './ChatMessages';
import ChatForm from './ChatForm';
import { useMessages } from '@/utilities/useMessages';
import { MessageRole } from '@/types/message';

export const ChatContext = createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>({
  isOpen: true,
  setIsOpen: () => {},
});

export const useChat = () => useContext(ChatContext);

export default function ChatContainer() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const { messages, setMessages } = useMessages();

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setMessages(prev => [...prev, { role: MessageRole.USER, content: message }]);
    setMessage('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    setMessages(prev => [...prev, { role: MessageRole.ASSISTANT, content: data.message }]);
  };

  return (
    <ChatContext.Provider value={{ isOpen, setIsOpen }}>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-200 shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] z-50"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}
      <ChatSidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ChatMessages messages={messages} />
        <ChatForm 
          message={message}
          onMessageChange={setMessage}
          onSubmit={handleSendMessage}
        />
      </ChatSidebar>
    </ChatContext.Provider>
  );
} 