import { AuthLayout } from '@/components/AuthLayout';
import ChatDrawer from '@/components/ChatDrawer';
import LeftSidebar from '@/components/LeftSidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout>
      <div className="flex h-screen bg-white">
        <LeftSidebar />
        <main className="flex-1 overflow-auto bg-white">
          {children}
        </main>
        <ChatDrawer />
      </div>
    </AuthLayout>
  );
} 