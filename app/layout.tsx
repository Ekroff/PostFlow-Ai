import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PostFlow AI — LinkedIn Content for Teams',
  description:
    'Generate, review, approve, schedule and auto-publish LinkedIn posts with AI. The only tool combining AI generation with team approval workflow for B2B teams.',
  keywords: 'LinkedIn post scheduler, AI LinkedIn content, team approval workflow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
