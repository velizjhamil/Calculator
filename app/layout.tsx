import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { HistoryProvider } from '@/lib/history-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'AI Calc',
  description: 'Advanced AI-powered calculator with graphs and step-by-step solutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#121212" />
      </head>
      <body className="font-sans antialiased bg-[#121212] text-white min-h-screen overflow-x-hidden">
        <HistoryProvider>
          {children}
        </HistoryProvider>
      </body>
    </html>
  );
}
