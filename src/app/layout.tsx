import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MessagesProvider } from "@/utilities/useMessages";
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrepWise - Recipe Dashboard",
  description: "Your personal recipe management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <AuthProvider>
          <MessagesProvider>
            {children}
          </MessagesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}