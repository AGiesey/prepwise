import LeftSidebar from '@/components/LeftSidebar';
import ChatContainer from '@/components/chat/ChatContainer';
import MainContentWrapper from '@/components/chat/MainContentWrapper';
import UserSync from '@/components/UserSync';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <UserSync />
      <LeftSidebar />
      <div className="flex-1 flex">
        <MainContentWrapper>
          {children}
        </MainContentWrapper>
        <ChatContainer />
      </div>
    </div>
  );
} 