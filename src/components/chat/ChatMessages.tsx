'use client';

import { MessageRole } from '@/types/message';

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
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 