interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

export default function Tooltip({ children, text }: TooltipProps) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-1000 whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );
} 