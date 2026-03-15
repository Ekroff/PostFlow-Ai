import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

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
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
