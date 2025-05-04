import { AuthLayout } from '@/components/AuthLayout';
import LeftSidebar from '@/components/LeftSidebar';
import ChatContainer from '@/components/chat/ChatContainer';
import MainContentWrapper from '@/components/chat/MainContentWrapper';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout>
      <div className="flex h-screen bg-white">
        <LeftSidebar />
        <div className="flex-1 flex">
          <MainContentWrapper>
            {children}
          </MainContentWrapper>
          <ChatContainer />
        </div>
      </div>
    </AuthLayout>
  );
} 