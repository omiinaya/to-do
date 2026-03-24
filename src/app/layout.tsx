import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationHandler } from "@/components/NotificationHandler";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "To Do",
  description: "Smart task management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <TooltipProvider>
          <div className="flex h-screen">
            {/* Desktop Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
              <Header />
              <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
                {children}
              </main>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <MobileNav />
          <NotificationHandler />
          <KeyboardShortcuts />
        </TooltipProvider>
      </body>
    </html>
  );
}
