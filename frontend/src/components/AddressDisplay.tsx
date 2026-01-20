/**
 * Composant AddressDisplay
 * Affiche une adresse Ethereum de manière lisible avec option de copie
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';
import { useState } from 'react';

interface AddressDisplayProps {
  address: string | undefined;
  isYou?: boolean;
}

/**
 * Affiche une adresse Ethereum tronquée avec option de copie
 */
export function AddressDisplay({ address, isYou }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  
  // Handle undefined address during loading
  if (!address) {
    return (
      <div className="flex items-center gap-2 font-mono text-xs sm:text-sm" role="status" aria-live="polite">
        <span className="text-muted-foreground">Loading address...</span>
      </div>
    );
  }

  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-2 font-mono text-xs sm:text-sm break-all">
      <span 
        className="select-all" 
        title={address}
        aria-label={`Ethereum address: ${address}`}
      >
        {short}
      </span>
      {isYou && (
        <Badge 
          variant="secondary" 
          className="text-xs"
          aria-label="This is your address"
        >
          You
        </Badge>
      )}
      <button
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1"
        aria-label={copied ? 'Address copied to clipboard' : `Copy address ${address} to clipboard`}
        title={copied ? 'Copied!' : 'Copy full address'}
        type="button"
      >
        <Copy className="h-3 w-3" aria-hidden="true" />
      </button>
      {copied && (
        <span 
          className="text-xs text-green-600 dark:text-green-400 font-normal"
          role="status"
          aria-live="polite"
        >
          Copied!
        </span>
      )}
    </div>
  );
}
