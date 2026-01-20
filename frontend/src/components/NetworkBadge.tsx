'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

const SUPPORTED_CHAINS: Record<number, { name: string; color: string }> = {
  [sepolia.id]: { name: 'Sepolia', color: 'bg-purple-500 text-white' },
  [hardhat.id]: { name: 'Localhost', color: 'bg-gray-500 text-white' },
};

const CHAIN_OPTIONS = [
  { id: sepolia.id, name: 'Sepolia Testnet', shortName: 'Sepolia' },
  { id: hardhat.id, name: 'Localhost (Hardhat)', shortName: 'Localhost' },
];

/**
 * Badge component that displays the current network and allows switching between supported networks.
 * 
 * Implements US-1.3 acceptance criteria:
 * - AC-1.3.1: Display current network badge
 * - AC-1.3.2: Show warning on unsupported network
 * - AC-1.3.3: Provide switch network button
 * - AC-1.3.4: Update UI after switch
 * - AC-1.3.6: Update automatically on network change
 */
export function NetworkBadge() {
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();
  const [showMenu, setShowMenu] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const chainInfo = SUPPORTED_CHAINS[chainId];
  const isSupported = !!chainInfo;

  // Handle switch chain errors
  useEffect(() => {
    if (error) {
      setSwitchError('Failed to switch network. Please try again.');
      // Clear error after 5 seconds
      const timeout = setTimeout(() => setSwitchError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Focus trap and keyboard navigation in menu
  useEffect(() => {
    if (!showMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
        buttonRef.current?.focus();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % CHAIN_OPTIONS.length);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + CHAIN_OPTIONS.length) % CHAIN_OPTIONS.length);
      }

      if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
      }

      if (e.key === 'End') {
        e.preventDefault();
        setFocusedIndex(CHAIN_OPTIONS.length - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMenu]);

  // Focus management when menu opens
  useEffect(() => {
    if (showMenu && menuRef.current) {
      const firstButton = menuRef.current.querySelector('button');
      firstButton?.focus();
      setFocusedIndex(0);
    }
  }, [showMenu]);

  const handleSwitchChain = (targetChainId: number) => {
    setSwitchError(null);
    switchChain(
      { chainId: targetChainId },
      {
        onSuccess: () => {
          setShowMenu(false);
        },
        onError: () => {
          // Error handled by useEffect above
        },
      }
    );
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <span role="img" aria-label="Warning">⚠️</span>
            <span>Wrong Network</span>
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSwitchChain(sepolia.id)}
            disabled={isPending}
            aria-label={isPending ? 'Switching to Sepolia network' : 'Switch to Sepolia Testnet network'}
          >
            {isPending ? 'Switching...' : 'Switch to Sepolia'}
          </Button>
        </div>
        {switchError && (
          <div role="alert" aria-live="polite" className="text-xs text-red-900 font-semibold">
            {switchError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowMenu(!showMenu);
          }
        }}
        disabled={isPending}
        aria-expanded={showMenu}
        aria-haspopup="menu"
        aria-label={`Current network: ${chainInfo.name}. Click to switch networks`}
        aria-controls="network-menu"
        className={`${chainInfo.color} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
      >
        <span>{chainInfo.name}</span>
        <span className="ml-1 text-xs" aria-hidden="true">▼</span>
      </button>

      {switchError && (
        <div 
          role="alert" 
          aria-live="polite" 
          className="absolute top-full mt-1 right-0 text-xs text-red-900 font-semibold whitespace-nowrap bg-red-50 px-2 py-1 rounded"
        >
          {switchError}
        </div>
      )}

      {showMenu && (
        <>
          {/* Backdrop to close menu - hidden from screen readers */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          {/* Dropdown menu */}
          <div 
            id="network-menu"
            ref={menuRef}
            className="absolute right-0 top-full mt-2 z-20 w-56 rounded-md bg-white shadow-lg ring-2 ring-gray-900 ring-opacity-10"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="network-menu-button"
          >
            <div className="py-1">
              {CHAIN_OPTIONS.map((chain, index) => (
                <button
                  key={chain.id}
                  onClick={() => handleSwitchChain(chain.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSwitchChain(chain.id);
                    }
                  }}
                  disabled={isPending || chainId === chain.id}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                    chainId === chain.id
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${focusedIndex === index ? 'bg-gray-50' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                  role="menuitem"
                  tabIndex={-1}
                  aria-label={`${chain.name}${chainId === chain.id ? ', currently selected' : ''}`}
                  aria-current={chainId === chain.id ? 'true' : 'false'}
                >
                  <div className="flex items-center justify-between">
                    <span>{chain.name}</span>
                    {chainId === chain.id && (
                      <span className="text-blue-600" aria-hidden="true">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
