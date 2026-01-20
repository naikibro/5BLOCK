import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { NetworkGuard } from '@/components/NetworkGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '5BLOCK - Pokemon Trading Card DApp',
  description: 'A decentralized application for trading Pokemon cards on the Ethereum blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <NetworkGuard>
            <main id="main-content" role="main">
              {children}
            </main>
          </NetworkGuard>
        </Providers>
      </body>
    </html>
  );
}
