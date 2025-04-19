import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

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
      <body className={`${inter.className} bg-white`}>
        <div className="flex h-screen">
          {/* Left Sidebar */}
          <aside className="w-64 bg-white text-black border-r border-gray-200 transition-all duration-300">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold">PrepWise</h1>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  <li>
                    <a href="/dashboard" className="flex items-center p-2 hover:bg-gray-100 rounded">
                      <ChartBarIcon className="h-5 w-5 mr-3" />
                      <span>Dashboard</span>
                    </a>
                  </li>
                  <li>
                    <a href="/recipes" className="flex items-center p-2 hover:bg-gray-100 rounded">
                      <DocumentTextIcon className="h-5 w-5 mr-3" />
                      <span>Recipes</span>
                    </a>
                  </li>
                  <li>
                    <a href="/meal-plan" className="flex items-center p-2 hover:bg-gray-100 rounded">
                      <CalendarIcon className="h-5 w-5 mr-3" />
                      <span>Meal Plan</span>
                    </a>
                  </li>
                  <li>
                    <a href="/shopping-list" className="flex items-center p-2 hover:bg-gray-100 rounded">
                      <ShoppingCartIcon className="h-5 w-5 mr-3" />
                      <span>Shopping List</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* Right Drawer */}
          <aside className="w-80 bg-white border-l border-gray-200">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  <h2 className="text-lg font-semibold">Chat Assistant</h2>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <div className="space-y-4">
                  {/* Chat messages will go here */}
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none"
                  />
                  <button className="px-4 py-2 bg-black text-white rounded-r hover:bg-gray-800">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </body>
    </html>
  );
}
