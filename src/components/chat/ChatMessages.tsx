'use client';

import { MessageRole } from '@/types/message';
import ReactMarkdown from 'react-markdown';
import { useEffect, useRef } from 'react';

interface ChatMessagesProps {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
  isLoading?: boolean;
  showTyping?: boolean;
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="p-3 rounded-2xl max-w-[80%] shadow-sm bg-indigo-50 text-indigo-900 border border-indigo-100">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function ChatMessages({ messages, isLoading = false, showTyping = false }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, showTyping]);

  return (
    <div className="flex-1 p-4 overflow-auto text-black flex flex-col">
      <div className="space-y-4 flex-1">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === MessageRole.ASSISTANT ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-3 rounded-2xl max-w-[80%] shadow-sm ${
              message.role === MessageRole.ASSISTANT 
                ? 'bg-indigo-50 text-indigo-900 border border-indigo-100' 
                : 'bg-gray-50 text-gray-800 border border-gray-100'
            }`}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {showTyping && messages.length > 0 && messages[messages.length - 1].role === MessageRole.USER && (
          <LoadingBubble />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 