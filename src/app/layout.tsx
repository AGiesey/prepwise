import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatDrawer from "@/components/ChatDrawer";
import LeftSidebar from "@/components/LeftSidebar";
import { MessagesProvider } from "@/utilities/useMessages";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrepWise - Recipe Dashboard",
  description: "Your personal recipe management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        <MessagesProvider>
          <div className="flex h-screen">
            <LeftSidebar />
            <main className="flex-1 overflow-auto bg-white">
              {children}
            </main>
            <ChatDrawer />
          </div>
        </MessagesProvider>
      </body>
    </html>
  );
}
