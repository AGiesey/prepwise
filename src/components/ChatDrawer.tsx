'use client';

import { useState } from 'react';
import { useMessages } from '@/utilities/useMessages';
import { MessageRole } from '@/types/message';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const { messages, setMessages } = useMessages();
  
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setMessages(prev => [...prev, { role: MessageRole.USER, content: message }]);
    setMessage('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: message }),
    });

    const data = await response.json();
    console.log(data.kwargs.content);

    setMessages(prev => [...prev, { role: MessageRole.ASSISTANT, content: data.kwargs.content }]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-200 shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)]"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}

      {/* Chat Drawer */}
      <aside 
        className={`fixed right-0 top-0 h-full w-80 bg-white border-l-2 border-gray-200 shadow-[-4px_0_8px_rgba(0,0,0,0.1)] transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b-2 border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-black">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-semibold">AI Sous Chef</h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full text-black transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto text-black">
            <div className="space-y-4">
              {
                messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === MessageRole.ASSISTANT ? 'justify-start' : 'justify-end'}`}>
                    <div className={`p-2 rounded-lg ${message.role === MessageRole.ASSISTANT ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                      {message.content}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="p-4 border-t-2 border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border-2 border-gray-300 rounded-l focus:outline-none text-black placeholder-gray-500 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-r hover:bg-gray-800 transition-colors duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}