'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const METAMASK_INSTALL_URL = 'https://metamask.io/download/';

type ConnectionError =
  | 'MetaMaskNotInstalled'
  | 'UserRejected'
  | 'AlreadyProcessing'
  | 'Unknown';

const errorMessages: Record<ConnectionError, string> = {
  MetaMaskNotInstalled: 'MetaMask is not installed. Please install it to continue.',
  UserRejected: 'Connection request was rejected. Please try again.',
  AlreadyProcessing: 'A connection request is already pending in MetaMask.',
  Unknown: 'An error occurred while connecting. Please try again.',
};

const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
};

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      const errorType = parseConnectionError(connectError.message);
      setError(errorMessages[errorType]);
    } else {
      setError(null);
    }
  }, [connectError]);

  // Format address: 0x1234...abcd
  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Extract error handling logic to avoid duplication
  const parseConnectionError = (errorMessage: string): ConnectionError => {
    const lowerMessage = errorMessage.toLowerCase();
    if (lowerMessage.includes('user rejected') || lowerMessage.includes('user denied')) {
      return 'UserRejected';
    }
    if (lowerMessage.includes('already processing')) {
      return 'AlreadyProcessing';
    }
    return 'Unknown';
  };

  const handleConnect = () => {
    setError(null);
    
    if (!isMetaMaskInstalled()) {
      setError(errorMessages.MetaMaskNotInstalled);
      return;
    }

    try {
      connect(
        { connector: injected({ target: 'metaMask' }) },
        {
          onError: (err) => {
            const errorType = parseConnectionError(err.message);
            setError(errorMessages[errorType]);
          },
        }
      );
    } catch {
      setError(errorMessages.Unknown);
    }
  };

  const handleDisconnect = () => {
    // Invalidate only wallet-specific queries, not all app cache
    queryClient.invalidateQueries({ queryKey: ['ownedCards'] });
    queryClient.invalidateQueries({ queryKey: ['userOffers'] });
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    // Disconnect the wallet
    disconnect();
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button disabled>
        Connect Wallet
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4" role="region" aria-label="Wallet connection status">
        <span 
          className="font-mono text-sm text-gray-900 font-semibold" 
          title={`Full wallet address: ${address}`}
        >
          {formatAddress(address)}
        </span>
        <Button 
          variant="outline" 
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  const isConnectingState = isConnecting || isPending;
  const showMetaMaskError = error === errorMessages.MetaMaskNotInstalled;

  return (
    <div className="flex flex-col items-end gap-2" role="region" aria-label="Wallet connection">
      {error && !showMetaMaskError && (
        <div 
          role="alert" 
          aria-live="polite" 
          className="text-sm text-red-900 font-semibold bg-red-50 px-3 py-1 rounded"
        >
          {error}
        </div>
      )}
      {showMetaMaskError ? (
        <div className="flex flex-col items-end gap-2">
          <div 
            role="alert" 
            aria-live="polite" 
            className="text-sm text-red-900 font-semibold bg-red-50 px-3 py-1 rounded flex items-center gap-2"
          >
            <span role="img" aria-label="Warning">⚠️</span>
            <span>{errorMessages.MetaMaskNotInstalled}</span>
          </div>
          <a
            href={METAMASK_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-1 font-medium"
            aria-label="Install MetaMask browser extension (opens in new tab)"
          >
            Install MetaMask
          </a>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isConnectingState}
        >
          {isConnectingState ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
}
