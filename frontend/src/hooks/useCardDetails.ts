/**
 * Hook useCardDetails
 * Récupère toutes les informations détaillées d'une carte (on-chain + IPFS)
 */

import { useReadContract } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { pokemonCardsAbi, pokemonCardsAddress } from '@/lib/contracts';
import { fetchIPFSMetadata } from '@/lib/ipfs';
import { CardDetails } from '@/types/pokemon';

interface UseCardDetailsReturn {
  details: CardDetails | null;
  exists: boolean;
  isLoading: boolean;
  notFound: boolean;
}

/**
 * Récupère les détails complets d'une carte par son tokenId
 */
export function useCardDetails(tokenId: bigint): UseCardDetailsReturn {
  // Check if token exists
  const { data: exists, isLoading: existsLoading } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'exists',
    args: [tokenId],
  });

  // Get owner
  const { data: owner } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'ownerOf',
    args: [tokenId],
    query: { enabled: !!exists },
  });

  // Get card metadata
  const { data: cardMeta } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'getCardMeta',
    args: [tokenId],
    query: { enabled: !!exists },
  });

  // Get previous owners
  const { data: previousOwners } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'getPreviousOwners',
    args: [tokenId],
    query: { enabled: !!exists },
  });

  // Get tokenURI
  const { data: tokenURI } = useReadContract({
    address: pokemonCardsAddress,
    abi: pokemonCardsAbi,
    functionName: 'tokenURI',
    args: [tokenId],
    query: { enabled: !!exists },
  });

  // Fetch IPFS metadata
  const { data: metadata, error: metadataError } = useQuery({
    queryKey: ['ipfs-metadata', tokenURI],
    queryFn: () => fetchIPFSMetadata(tokenURI as string),
    enabled: !!tokenURI,
    staleTime: Infinity,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Log metadata fetch errors for debugging
  if (metadataError) {
    console.error('Failed to fetch IPFS metadata:', metadataError);
  }

  // Calculate lock status
  const now = Math.floor(Date.now() / 1000);
  const lockUntil = Number(cardMeta?.lockUntil ?? 0);

  // Build details object
  const details: CardDetails | null = exists
    ? {
        tokenId,
        owner: owner as `0x${string}`,
        pokemonId: Number(cardMeta?.pokemonId ?? 0),
        rarityTier: Number(cardMeta?.rarityTier ?? 1) as 1 | 2 | 3 | 4,
        value: Number(cardMeta?.value ?? 0),
        createdAt: new Date(Number(cardMeta?.createdAt ?? 0) * 1000),
        lastTransferAt: new Date(Number(cardMeta?.lastTransferAt ?? 0) * 1000),
        lockUntil: new Date(lockUntil * 1000),
        isLocked: lockUntil > now,
        lockRemaining: Math.max(0, lockUntil - now),
        previousOwners: (previousOwners as `0x${string}`[]) ?? [],
        tokenURI: tokenURI as string,
        metadata: metadata ?? null,
      }
    : null;

  return {
    details,
    exists: !!exists,
    isLoading: existsLoading,
    notFound: !existsLoading && !exists,
  };
}
