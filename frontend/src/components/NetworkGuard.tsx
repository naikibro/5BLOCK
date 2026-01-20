'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSwitchChain } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface NetworkGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that blocks content when user is on an unsupported network.
 * Shows a full-page alert with option to switch networks.
 * 
 * Implements US-1.3 acceptance criteria:
 * - AC-1.3.2: Show warning on wrong network
 * - AC-1.3.3: Provide switch button
 * - AC-1.3.4: Update UI after switch
 * - AC-1.3.5: Block interactions on wrong network
 * 
 * @example
 * // In app layout
 * <NetworkGuard>
 *   <YourApp />
 * </NetworkGuard>
 */
export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isSupported, chainName } = useNetworkStatus();
  const { switchChain, isPending, error } = useSwitchChain();
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Handle switch errors
  useEffect(() => {
    if (error) {
      setSwitchError('Failed to switch network. Please try again or switch manually in your wallet.');
    }
  }, [error]);

  const handleSwitchNetwork = (chainId: number) => {
    setSwitchError(null);
    switchChain(
      { chainId },
      {
        onError: () => {
          // Error handled by useEffect above
        },
      }
    );
  };

  if (!isSupported) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <div className="flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <AlertTitle>Wrong Network Detected</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  You are currently connected to <strong>{chainName}</strong>.
                  This application requires <strong>Sepolia Testnet</strong> or <strong>Localhost</strong>.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => handleSwitchNetwork(sepolia.id)}
                    disabled={isPending}
                  >
                    {isPending ? 'Switching...' : 'Switch to Sepolia'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSwitchNetwork(hardhat.id)}
                    disabled={isPending}
                  >
                    {isPending ? 'Switching...' : 'Switch to Localhost'}
                  </Button>
                </div>
                {switchError && (
                  <p className="mt-4 text-sm text-red-700">
                    {switchError}
                  </p>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
