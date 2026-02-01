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
      // Cache court pour détecter les changements rapidement
      staleTime: 5000, // 5 secondes
      refetchOnMount: true,
      refetchOnWindowFocus: true, // Rafraîchir quand l'onglet redevient actif
    },
  });

  return {
    isMinted: Boolean(isMinted),
    isLoading,
  };
}
