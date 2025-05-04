'use client';

import { MessageRole } from '@/types/message';
import ReactMarkdown from 'react-markdown';

interface ChatMessagesProps {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 p-4 overflow-auto text-black flex flex-col">
      <div className="space-y-4 flex-1">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === MessageRole.ASSISTANT ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-2 rounded-lg ${message.role === MessageRole.ASSISTANT ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 