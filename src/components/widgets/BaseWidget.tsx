import { ReactNode } from 'react';

interface BaseWidgetProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function BaseWidget({ title, children, className = '' }: BaseWidgetProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border-2 border-gray-200 shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.1)] transition-all duration-200 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
} 