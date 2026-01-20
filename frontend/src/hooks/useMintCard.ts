/**
 * Hook pour minter une carte Pokemon
 * Gère les étapes: pin image → pin metadata → mint on-chain
 */

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Pokemon } from '@/types/pokemon';
import { pokemonCardsAbi, pokemonCardsAddress } from '@/lib/contracts';
import { pinImageToIPFS, pinMetadataToIPFS } from '@/lib/pinata';
import { buildCardMetadata } from '@/lib/metadata';

/**
 * Étapes du processus de mint
 */
export type MintStep =
  | 'idle'
  | 'pinning-image'
  | 'pinning-metadata'
  | 'minting'
  | 'confirming'
  | 'success'
  | 'error';

export interface UseMintCardReturn {
  mint: (pokemon: Pokemon) => Promise<void>;
  step: MintStep;
  error: Error | null;
  txHash: `0x${string}` | undefined;
  tokenId: bigint | undefined;
  reset: () => void;
}

/**
 * Hook pour minter une carte Pokemon avec upload IPFS
 * @returns Fonctions et états pour le mint
 */
export function useMintCard(): UseMintCardReturn {
  const [step, setStep] = useState<MintStep>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [tokenId, setTokenId] = useState<bigint>();

  const queryClient = useQueryClient();

  const {
    writeContractAsync,
    data: txHash,
    reset: resetWrite,
  } = useWriteContract();

  // Attendre la confirmation de la transaction
  useWaitForTransactionReceipt({
    hash: txHash,
  });

  /**
   * Fonction principale de mint
   * Exécute toutes les étapes séquentiellement
   */
  const mint = async (pokemon: Pokemon) => {
    try {
      setError(null);

      // ==================
      // STEP 1: Pin Image
      // ==================
      setStep('pinning-image');
      const imageCID = await pinImageToIPFS(pokemon.image, pokemon.id);

      // =======================
      // STEP 2: Pin Metadata
      // =======================
      setStep('pinning-metadata');
      const metadata = buildCardMetadata(pokemon, imageCID);
      const metadataCID = await pinMetadataToIPFS(metadata);
      const tokenURI = `ipfs://${metadataCID}`;

      // ======================
      // STEP 3: Mint On-chain
      // ======================
      setStep('minting');
      await writeContractAsync({
        address: pokemonCardsAddress,
        abi: pokemonCardsAbi,
        functionName: 'mint',
        args: [
          BigInt(pokemon.id), // pokemonId
          pokemon.rarityTier, // rarityTier (1-4)
          BigInt(pokemon.value), // value
          tokenURI, // tokenURI (ipfs://...)
        ],
      });

      // ===============================
      // STEP 4: Wait for Confirmation
      // ===============================
      setStep('confirming');

      // La confirmation est gérée par useWaitForTransactionReceipt
      // On met à jour le step quand isConfirmed change

      setStep('success');

      // Invalider les caches pour rafraîchir l'UI
      queryClient.invalidateQueries({ queryKey: ['ownedCards'] });
      queryClient.invalidateQueries({ queryKey: ['ownedCount'] });
      queryClient.invalidateQueries({ queryKey: ['pokemon', 'list'] });
    } catch (err) {
      setStep('error');
      const errorMessage =
        err instanceof Error ? err.message : 'Mint failed';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  /**
   * Reset tous les états
   */
  const reset = () => {
    setStep('idle');
    setError(null);
    setTokenId(undefined);
    resetWrite();
  };

  return {
    mint,
    step,
    error,
    txHash,
    tokenId,
    reset,
  };
}
