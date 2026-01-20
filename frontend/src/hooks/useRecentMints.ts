/**
 * Hook useShowcasePokemon
 * Retourne des données statiques de Pokémon populaires pour la landing page
 * Note: Ceci est un showcase statique, PAS de vrais mints récents de la blockchain
 * Dans une app production, utilisez un backend indexer pour les vrais événements
 */

import { useReadContract } from 'wagmi';
import { pokemonCardsAbi, pokemonCardsAddress } from '@/lib/contracts';
import { useQuery } from '@tanstack/react-query';
import { fetchIPFSMetadata } from '@/lib/ipfs';
import type { RarityTier } from '@/types/pokemon';

export interface ShowcasePokemon {
  tokenId: bigint;
  owner: string;
  pokemonId: number;
  rarityTier: RarityTier;
  timestamp: number;
  metadata?: {
    name: string;
    image: string;
  };
}

/**
 * Pour la landing page, on utilise des données de showcase statiques
 * Cela évite le polling constant de la blockchain et améliore les performances
 */
export function useShowcasePokemon() {
  // Showcase des Pokémon les plus populaires pour la démo
  const showcasePokemon = [
    { pokemonId: 25, rarityTier: 3 }, // Pikachu
    { pokemonId: 6, rarityTier: 4 },  // Charizard
    { pokemonId: 3, rarityTier: 3 },  // Venusaur
    { pokemonId: 9, rarityTier: 3 },  // Blastoise
    { pokemonId: 150, rarityTier: 4 }, // Mewtwo
    { pokemonId: 94, rarityTier: 3 },  // Gengar
    { pokemonId: 130, rarityTier: 3 }, // Gyarados
    { pokemonId: 143, rarityTier: 4 }, // Snorlax
  ];

  return {
    showcasePokemon: showcasePokemon.map((p, idx) => ({
      tokenId: BigInt(idx),
      owner: '0x0000000000000000000000000000000000000000',
      pokemonId: p.pokemonId,
      rarityTier: p.rarityTier,
      timestamp: Date.now() - idx * 1000000,
      metadata: undefined,
    })),
    isLoading: false,
  };
}

/**
 * Hook pour récupérer les métadonnées d'une carte mintée
 */
export function useMintMetadata(tokenId: bigint | undefined) {
  const { data: tokenURI } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'tokenURI',
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  });

  const { data: metadata, isLoading } = useQuery({
    queryKey: ['mint-metadata', tokenURI],
    queryFn: () => fetchIPFSMetadata(tokenURI as string),
    enabled: !!tokenURI,
    staleTime: Infinity,
  });

  return {
    metadata: metadata ? {
      name: metadata.name,
      image: metadata.image,
    } : undefined,
    isLoading,
  };
}
