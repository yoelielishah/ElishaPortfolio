'use client';

import Footer from "../components/footer";
import Header from "../components/header/header";
import { ThemeProvider } from "./themeProvider";
import { Toaster } from '../components/ui/sonner';
import { useState } from "react";
import { Chat } from '@/components/chat/chat';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <main className="pb-8 min-h-screen bg-background text-foreground break-words leading-6 transition-colors duration-500 justify-center">
        <Header />
        <Toaster />
        <div className="px-5 pt-14 mx-auto max-w-3xl justify-center">
          {children}
        </div>
        {/* Floating AI Assistant Button and Modal */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 bg-teal-700 text-white rounded-full p-4 shadow-lg z-50"
            type="button"
          >
            Ask My AI Assistant
          </button>
        )}
        {open && (
          <div className="fixed bottom-20 right-6 w-96 max-w-full bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-4 z-50">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              aria-label="Close AI"
            >
              ✕
            </button>
            <Chat
              id="portfolio-assistant"
              initialMessages={[
                {
                  id: 'system-1',
                  role: 'system',
                  content: 'A helpful assistant for Elisha portfolio',
                  parts: [
                    { type: 'text', text: 'A helpful assistant for Elisha portfolio. ' }
                  ]
                }
              ]}
              initialChatModel="gpt-3.5-turbo"
              autoResume={false}
               // endpoint="/api/chat" e
            />
          </div>
        )}
        <Footer />
      </main>
    </ThemeProvider>
  );
}