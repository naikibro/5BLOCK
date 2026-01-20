/**
 * Hook pour récupérer toutes les cartes possédées par l'utilisateur
 * Combine les données on-chain (contrat) + off-chain (IPFS metadata)
 */

'use client';

import { useAccount, useReadContracts } from 'wagmi';
import { useQueries } from '@tanstack/react-query';
import { pokemonCardsAbi, pokemonCardsAddress, MAX_CARDS_PER_WALLET } from '@/lib/contracts';
import { fetchIPFSMetadata } from '@/lib/ipfs';
import type { OwnedCard, CardMetadata } from '@/types/pokemon';

interface CardMeta {
  createdAt: bigint;
  lastTransferAt: bigint;
  lockUntil: bigint;
  pokemonId: bigint;
  rarityTier: number;
  value: bigint;
}

export function useOwnedCards() {
  const { address } = useAccount();

  // Step 1: Get balance (number of tokens owned)
  const balanceQuery = useReadContracts({
    contracts: [
      {
        address: pokemonCardsAddress,
        abi: pokemonCardsAbi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
      },
    ],
    query: { enabled: !!address },
  });

  const balance = balanceQuery.data?.[0]?.result as bigint | undefined;
  const tokenCount = Number(balance ?? 0);

  // Step 2: Get all token IDs
  const tokenIdQueries = useReadContracts({
    contracts: Array.from({ length: tokenCount }, (_, i) => ({
      address: pokemonCardsAddress,
      abi: pokemonCardsAbi,
      functionName: 'tokenOfOwnerByIndex',
      args: address ? [address, BigInt(i)] : undefined,
    })),
    query: { enabled: !!address && tokenCount > 0 },
  });

  const tokenIds = (tokenIdQueries.data
    ?.map((result) => result.result as bigint | undefined)
    .filter((id): id is bigint => id !== undefined)) ?? [];

  // Step 3: Get card metadata for each token
  const cardMetaQueries = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: pokemonCardsAddress,
      abi: pokemonCardsAbi,
      functionName: 'getCardMeta',
      args: [tokenId],
    })),
    query: { enabled: tokenIds.length > 0 },
  });

  // Step 4: Get tokenURIs for each token
  const tokenUriQueries = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: pokemonCardsAddress,
      abi: pokemonCardsAbi,
      functionName: 'tokenURI',
      args: [tokenId],
    })),
    query: { enabled: tokenIds.length > 0 },
  });

  // Step 5: Fetch IPFS metadata for each tokenURI
  const metadataQueries = useQueries({
    queries: (tokenUriQueries.data ?? []).map((result) => ({
      queryKey: ['ipfs-metadata', result.result],
      queryFn: () => fetchIPFSMetadata(result.result as string),
      enabled: !!result.result,
      staleTime: Infinity,
      retry: 2,
    })),
  });

  // Combine all data
  const now = Math.floor(Date.now() / 1000);

  const cards: OwnedCard[] = tokenIds.map((tokenId, i) => {
    const cardMetaResult = cardMetaQueries.data?.[i]?.result as CardMeta | undefined;
    const metadata = (metadataQueries[i]?.data as CardMetadata) ?? null;
    const lockUntil = Number(cardMetaResult?.lockUntil ?? 0n);

    return {
      tokenId,
      // On-chain data
      pokemonId: Number(cardMetaResult?.pokemonId ?? 0n),
      rarityTier: Number(cardMetaResult?.rarityTier ?? 1) as 1 | 2 | 3 | 4,
      value: Number(cardMetaResult?.value ?? 0n),
      createdAt: Number(cardMetaResult?.createdAt ?? 0n),
      lastTransferAt: Number(cardMetaResult?.lastTransferAt ?? 0n),
      lockUntil,
      // Computed
      isLocked: lockUntil > now,
      lockRemaining: Math.max(0, lockUntil - now),
      // IPFS metadata
      metadata,
    };
  });

  const isLoading =
    balanceQuery.isLoading ||
    tokenIdQueries.isLoading ||
    cardMetaQueries.isLoading ||
    tokenUriQueries.isLoading ||
    metadataQueries.some((q) => q.isLoading);

  return {
    cards,
    count: cards.length,
    maxCards: MAX_CARDS_PER_WALLET,
    isLoading,
    isEmpty: !isLoading && cards.length === 0,
  };
}
