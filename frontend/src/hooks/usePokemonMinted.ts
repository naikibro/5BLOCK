/**
 * Hook pour vérifier si un Pokémon a déjà été minté
 */

'use client';

import { useReadContract } from 'wagmi';
import { pokemonCardsAddress, pokemonCardsAbi } from '@/lib/contracts';

/**
 * Vérifie si un Pokémon spécifique a déjà été minté
 * @param pokemonId L'ID du Pokémon (1-151)
 * @returns Objet contenant l'état du mint
 */
export function usePokemonMinted(pokemonId: number) {
  const { data: isMinted, isLoading } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'isPokemonMinted',
    args: [BigInt(pokemonId)],
    query: {
      enabled: pokemonId >= 1 && pokemonId <= 151,
      // Cache longue durée - un Pokémon minté ne peut plus être minté
      staleTime: 60000, // 1 minute
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  });

  return {
    isMinted: Boolean(isMinted),
    isLoading,
  };
}
