'use client';

interface ChatFormProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ChatForm({ message, onMessageChange, onSubmit }: ChatFormProps) {
  return (
    <div className="p-4 border-t-2 border-gray-200">
      <form onSubmit={onSubmit} className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
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
  );
} 