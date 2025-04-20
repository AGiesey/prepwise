'use client';

import { Message } from '@/types/message';
import React, { useContext, createContext, useState } from 'react';

interface MessagesContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <MessagesContext.Provider value={{ messages, setMessages }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }

  return {
    messages: context.messages,
    setMessages: context.setMessages,
  };
};
