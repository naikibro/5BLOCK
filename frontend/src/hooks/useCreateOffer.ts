/**
 * Hook pour créer une offre d'échange
 * Permet à un utilisateur de proposer un échange de cartes
 */

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { tradeMarketAbi, tradeMarketAddress } from '@/lib/contracts';

export interface UseCreateOfferReturn {
  createOffer: (makerTokenId: bigint, takerTokenId: bigint) => Promise<`0x${string}`>;
  txHash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  onSuccess: () => void;
}

/**
 * Hook pour créer une offre d'échange
 * Gère la transaction et l'invalidation du cache
 * @returns Fonctions et états pour créer une offre
 */
export function useCreateOffer(): UseCreateOfferReturn {
  const queryClient = useQueryClient();

  const {
    writeContractAsync,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  /**
   * Crée une nouvelle offre d'échange
   * @param makerTokenId - ID de la carte proposée
   * @param takerTokenId - ID de la carte demandée
   * @returns Hash de la transaction
   */
  const createOffer = async (
    makerTokenId: bigint,
    takerTokenId: bigint
  ): Promise<`0x${string}`> => {
    const hash = await writeContractAsync({
      address: tradeMarketAddress,
      abi: tradeMarketAbi,
      functionName: 'createOffer',
      args: [makerTokenId, takerTokenId],
    });

    return hash;
  };

  /**
   * Invalide les queries reliées après succès
   */
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['openOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    queryClient.invalidateQueries({ queryKey: ['cooldown'] });
  };

  const error = writeError || confirmError;

  return {
    createOffer,
    txHash,
    isPending: isWriting || isConfirming,
    isConfirming,
    isConfirmed,
    error,
    onSuccess,
  };
}
