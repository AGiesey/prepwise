interface MainContentWrapperProps {
  children: React.ReactNode;
}

export default function MainContentWrapper({ children }: MainContentWrapperProps) {

  return (
    <main className="flex-1 overflow-auto bg-white">
      {children}
    </main>
  );
} 