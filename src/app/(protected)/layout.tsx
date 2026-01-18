import LeftSidebar from '@/components/LeftSidebar';
import ChatContainer from '@/components/chat/ChatContainer';
import MainContentWrapper from '@/components/chat/MainContentWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserSync from '@/components/UserSync';
import { UserProvider } from '@/utilities/useUser';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ProtectedRoute>
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
      </ProtectedRoute>
    </UserProvider>
  );
} 