'use client';

import { useState, createContext, useContext } from 'react';
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ChatSidebar from './ChatSidebar';
import ChatMessages from './ChatMessages';
import ChatForm from './ChatForm';
import { useMessages } from '@/utilities/useMessages';
import { MessageRole } from '@/types/message';
import { useChatContext } from './utils/chatContext';
import { CreateRecipeDTO } from '@/types/dtos';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [recipeData, setRecipeData] = useState<CreateRecipeDTO | null>(null);
  const { messages, setMessages } = useMessages();
  const { type, id } = useChatContext();

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setMessages(prev => [...prev, { role: MessageRole.USER, content: message }]);
    setMessage('');
    setIsLoading(true);
    setShowTyping(false);
    setRecipeData(null); // Clear previous recipe data

    // Add a small delay before showing the typing indicator
    const typingTimer = setTimeout(() => {
      setShowTyping(true);
    }, 750);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, type, id }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: MessageRole.ASSISTANT, content: data.message }]);
      
      // Check if response contains recipe data
      if (data.metadata?.recipeData) {
        const recipe = data.metadata.recipeData as CreateRecipeDTO;
        setRecipeData(recipe);
        // Console.log the JSON response in browser
        console.log('Recipe Creation JSON Response:', JSON.stringify(recipe, null, 2));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      clearTimeout(typingTimer);
      setIsLoading(false);
      setShowTyping(false);
    }
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
        <ChatMessages messages={messages} isLoading={isLoading} showTyping={showTyping} />
        <ChatForm 
          message={message}
          onMessageChange={setMessage}
          onSubmit={handleSendMessage}
          recipeData={recipeData}
          onRecipeDataClear={() => setRecipeData(null)}
        />
      </ChatSidebar>
    </ChatContext.Provider>
  );
} 