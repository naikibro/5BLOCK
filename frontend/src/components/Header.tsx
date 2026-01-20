'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './WalletConnect';
import { NetworkBadge } from './NetworkBadge';

/**
 * Header component with wallet connection and network status.
 * Displays the app title, navigation, network badge, and wallet connection controls.
 * Fully accessible with skip navigation, ARIA landmarks, and keyboard navigation.
 */
export function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header role="banner" className="border-b-2 border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                className="text-2xl font-bold text-blue-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
                aria-label="5BLOCK Home"
              >
                5BLOCK
              </Link>
              <nav role="navigation" aria-label="Main navigation">
                <ul className="flex items-center gap-4 list-none m-0 p-0">
                  <li>
                    <Link 
                      href="/catalog" 
                      className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-1 ${
                        pathname === '/catalog'
                          ? 'text-blue-600 underline underline-offset-4'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      aria-current={pathname === '/catalog' ? 'page' : undefined}
                    >
                      Catalog
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/inventory" 
                      className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-1 ${
                        pathname === '/inventory'
                          ? 'text-blue-600 underline underline-offset-4'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      aria-current={pathname === '/inventory' ? 'page' : undefined}
                    >
                      Inventory
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/trade" 
                      className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-1 ${
                        pathname === '/trade'
                          ? 'text-blue-600 underline underline-offset-4'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      aria-current={pathname === '/trade' ? 'page' : undefined}
                    >
                      Trade
                    </Link>
                  </li>
                </ul>
              </nav>
              <NetworkBadge />
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>
    </>
  );
}
