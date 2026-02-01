'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

/**
 * Badge component that displays the current network.
 * Simplified version for Sepolia-only deployment.
 * 
 * Implements US-1.3 acceptance criteria:
 * - AC-1.3.1: Display current network badge
 * - AC-1.3.2: Show warning on unsupported network
 * - AC-1.3.3: Provide switch network button (only when on wrong network)
 */
export function NetworkBadge() {
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isOnSepolia = chainId === sepolia.id;

  // Fix hydration error: only show network after client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle switch chain errors
  useEffect(() => {
    if (error) {
      setSwitchError('Failed to switch network. Please try again.');
      // Clear error after 5 seconds
      const timeout = setTimeout(() => setSwitchError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleSwitchToSepolia = () => {
    setSwitchError(null);
    switchChain({ chainId: sepolia.id });
  };

  // Prevent hydration mismatch: show placeholder during SSR
  if (!isMounted) {
    return (
      <div className="bg-gray-300 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
        <span className="opacity-0">Loading...</span>
      </div>
    );
  }

  if (!isOnSepolia) {
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
            onClick={handleSwitchToSepolia}
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
    <div
      className="bg-purple-500 text-white inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      aria-label="Current network: Sepolia Testnet"
    >
      <span>Sepolia</span>
    </div>
  );
}
