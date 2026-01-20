'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';
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
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      const errorMessage = connectError.message.toLowerCase();
      if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
        setError(errorMessages.UserRejected);
      } else if (errorMessage.includes('already processing')) {
        setError(errorMessages.AlreadyProcessing);
      } else {
        setError(errorMessages.Unknown);
      }
    } else {
      setError(null);
    }
  }, [connectError]);

  // Format address: 0x1234...abcd
  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
            const errorMessage = err.message.toLowerCase();
            if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
              setError(errorMessages.UserRejected);
            } else if (errorMessage.includes('already processing')) {
              setError(errorMessages.AlreadyProcessing);
            } else {
              setError(errorMessages.Unknown);
            }
          },
        }
      );
    } catch (err) {
      setError(errorMessages.Unknown);
    }
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
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm">{formatAddress(address)}</span>
        <Button variant="outline" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  const isConnectingState = isConnecting || isPending;
  const showMetaMaskError = error === errorMessages.MetaMaskNotInstalled;

  return (
    <div className="flex flex-col items-end gap-2">
      {error && !showMetaMaskError && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {showMetaMaskError ? (
        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-red-600">⚠️ {errorMessages.MetaMaskNotInstalled}</div>
          <a
            href={METAMASK_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
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
