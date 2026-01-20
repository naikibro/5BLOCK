/**
 * Hook pour récupérer le nombre de cartes possédées par un wallet
 * Vérifie la limite de 4 cartes max par wallet
 */

import { useAccount, useReadContract } from 'wagmi';
import { pokemonCardsAbi, pokemonCardsAddress, MAX_CARDS_PER_WALLET } from '@/lib/contracts';

export function useOwnedCount() {
  const { address } = useAccount();

  const { data: count, isLoading, error } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'getOwnedCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const countNumber = count ? Number(count) : 0;
  const remaining = MAX_CARDS_PER_WALLET - countNumber;
  const canMint = countNumber < MAX_CARDS_PER_WALLET;

  return {
    count: countNumber,
    remaining: Math.max(0, remaining),
    canMint,
    maxCards: MAX_CARDS_PER_WALLET,
    isLoading,
    error,
  };
}
