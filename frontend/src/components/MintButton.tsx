/**
 * Composant MintButton
 * Bouton pour minter une carte Pokemon avec modal de progression
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useMintCard, type MintStep } from '@/hooks/useMintCard';
import { useOwnedCount } from '@/hooks/useOwnedCount';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePokemonMinted } from '@/hooks/usePokemonMinted';
import { Pokemon } from '@/types/pokemon';
import { Loader2, Check, AlertCircle, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MintButtonProps {
  pokemon: Pokemon;
}

/**
 * Messages pour chaque étape du mint
 */
const STEP_MESSAGES: Record<MintStep, string> = {
  idle: 'Mint Card',
  'pinning-image': 'Uploading image to IPFS...',
  'pinning-metadata': 'Uploading metadata to IPFS...',
  minting: 'Confirm in MetaMask...',
  confirming: 'Waiting for confirmation...',
  success: 'Minted successfully!',
  error: 'Mint failed',
};

export function MintButton({ pokemon }: MintButtonProps) {
  const { isConnected } = useAccount();
  const { isSupported } = useNetworkStatus();
  const { canMint } = useOwnedCount();
  const { isMinted, isLoading: isCheckingMinted } = usePokemonMinted(pokemon.id);
  const { mint, step, error, txHash, reset } = useMintCard();

  const [showDialog, setShowDialog] = useState(false);

  const isProcessing = !['idle', 'success', 'error'].includes(step);
  const isDisabled =
    !isConnected || !isSupported || !canMint || isProcessing || isMinted;

  const handleMint = async () => {
    if (isMinted) return; // Ne rien faire si déjà minté
    
    setShowDialog(true);
    try {
      await mint(pokemon);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    reset();
  };

  // Déterminer le label du bouton
  let buttonLabel = 'Mint Card';
  let buttonIcon = null;
  
  if (isCheckingMinted) {
    buttonLabel = 'Checking...';
    buttonIcon = <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  } else if (isMinted) {
    buttonLabel = 'Already Minted';
    buttonIcon = <Lock className="mr-2 h-4 w-4" />;
  } else if (!isConnected) {
    buttonLabel = 'Connect Wallet';
  } else if (!isSupported) {
    buttonLabel = 'Wrong Network';
  } else if (!canMint) {
    buttonLabel = 'Max Cards (4/4)';
  } else if (isProcessing) {
    buttonLabel = STEP_MESSAGES[step];
    buttonIcon = <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  }

  return (
    <>
      <Button
        onClick={handleMint}
        disabled={isDisabled}
        className="w-full"
        variant={isMinted ? 'outline' : 'default'}
      >
        {buttonIcon}
        {buttonLabel}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minting {pokemon.displayName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress steps */}
            <MintStepDisplay
              label="Upload image to IPFS"
              status={getStepStatus(step, 'pinning-image')}
            />
            <MintStepDisplay
              label="Upload metadata to IPFS"
              status={getStepStatus(step, 'pinning-metadata')}
            />
            <MintStepDisplay
              label="Create token on blockchain"
              status={getStepStatus(step, 'minting')}
            />
            <MintStepDisplay
              label="Confirm transaction"
              status={getStepStatus(step, 'confirming')}
            />

            {/* Success state */}
            {step === 'success' && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-700">
                  Successfully minted {pokemon.displayName}!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Your card is now locked for 10 minutes.
                </p>
                {txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline mt-2 block"
                  >
                    View transaction
                  </a>
                )}
              </div>
            )}

            {/* Error state */}
            {step === 'error' && error && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="font-semibold text-red-700">Mint Failed</p>
                <p className="text-sm text-red-600 mt-1">{error.message}</p>
              </div>
            )}

            {/* Close button */}
            {(step === 'success' || step === 'error') && (
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Composant helper pour afficher l'état d'une étape
 */
function MintStepDisplay({
  label,
  status,
}: {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}) {
  return (
    <div className="flex items-center gap-3">
      {status === 'pending' && (
        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
      )}
      {status === 'active' && (
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      )}
      {status === 'done' && <Check className="h-4 w-4 text-green-500" />}
      {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
      <span
        className={
          status === 'done'
            ? 'text-green-700'
            : status === 'active'
              ? 'text-blue-700'
              : 'text-gray-500'
        }
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Détermine le statut d'une étape donnée
 */
function getStepStatus(
  currentStep: MintStep,
  targetStep: MintStep
): 'pending' | 'active' | 'done' | 'error' {
  const steps: MintStep[] = [
    'pinning-image',
    'pinning-metadata',
    'minting',
    'confirming',
  ];
  const currentIndex = steps.indexOf(currentStep);
  const targetIndex = steps.indexOf(targetStep);

  if (currentStep === 'error') return 'error';
  if (currentStep === 'success') return 'done';
  if (currentIndex === targetIndex) return 'active';
  if (currentIndex > targetIndex) return 'done';
  return 'pending';
}
