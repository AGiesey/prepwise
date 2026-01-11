import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MessagesProvider } from "@/utilities/useMessages";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
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
        <Auth0Provider>
          <MessagesProvider>
            {children}
          </MessagesProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}