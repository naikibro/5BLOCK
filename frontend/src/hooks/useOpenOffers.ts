/**
 * Hook pour récupérer toutes les offres d'échange ouvertes
 * Enrichit les données avec les informations des cartes et métadonnées IPFS
 */

'use client';

import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { useQueries } from '@tanstack/react-query';
import {
  tradeMarketAbi,
  tradeMarketAddress,
  pokemonCardsAbi,
  pokemonCardsAddress,
} from '@/lib/contracts';
import { fetchIPFSMetadata } from '@/lib/ipfs';
import type { CardMetadata } from '@/types/pokemon';

export interface TradeOffer {
  offerId: bigint;
  maker: `0x${string}`;
  makerTokenId: bigint;
  takerTokenId: bigint;
  status: number;
  createdAt: number;
  // Enriched data
  makerCard: {
    metadata: CardMetadata | null;
    owner: `0x${string}`;
    isLocked: boolean;
  };
  takerCard: {
    metadata: CardMetadata | null;
    owner: `0x${string}`;
    isLocked: boolean;
  };
  // Computed
  isMyOffer: boolean;
  canAccept: boolean;
}

interface OfferResult {
  maker: `0x${string}`;
  makerTokenId: bigint;
  takerTokenId: bigint;
  status: number;
  createdAt: bigint;
}

export interface UseOpenOffersReturn {
  offers: TradeOffer[];
  myOffers: TradeOffer[];
  acceptableOffers: TradeOffer[];
  isLoading: boolean;
  isEmpty: boolean;
}

/**
 * Hook pour récupérer et enrichir les offres d'échange ouvertes
 * Charge les données des cartes et métadonnées IPFS
 * @returns Offres enrichies avec filtres
 */
export function useOpenOffers(): UseOpenOffersReturn {
  const { address } = useAccount();

  // Step 1: Get list of open offer IDs
  const { data: openOfferIds, isLoading: isLoadingIds } = useReadContract({
    address: tradeMarketAddress,
    abi: tradeMarketAbi,
    functionName: 'getOpenOffers',
  });

  const offerCount = Array.isArray(openOfferIds) ? openOfferIds.length : 0;

  // Step 2: Get all offer details
  const offerQueries = useReadContracts({
    contracts:
      openOfferIds?.map((offerId) => ({
        address: tradeMarketAddress,
        abi: tradeMarketAbi,
        functionName: 'getOffer',
        args: [offerId],
      })) ?? [],
    query: { enabled: offerCount > 0 },
  });

  // Extract offer data
  const rawOffers: Array<{ offer: OfferResult; offerId: bigint }> =
    openOfferIds?.map((offerId, index) => ({
      offer: offerQueries.data?.[index]?.result as OfferResult,
      offerId,
    })) ?? [];

  // Filter to only Open offers (status === 0)
  const openOffers = rawOffers.filter((item) => item.offer?.status === 0);

  // Step 3: Get all unique card IDs
  const allCardIds = openOffers.flatMap((item) => [
    item.offer.makerTokenId,
    item.offer.takerTokenId,
  ]);
  const uniqueCardIds = [
    ...new Set(allCardIds.map((id) => id.toString())),
  ].map(BigInt);

  // Step 4: Batch fetch card details (tokenURI, owner, isLocked)
  const cardDataQueries = useReadContracts({
    contracts: uniqueCardIds.flatMap((tokenId) => [
      {
        address: pokemonCardsAddress,
        abi: pokemonCardsAbi,
        functionName: 'tokenURI',
        args: [tokenId],
      },
      {
        address: pokemonCardsAddress,
        abi: pokemonCardsAbi,
        functionName: 'ownerOf',
        args: [tokenId],
      },
      {
        address: pokemonCardsAddress,
        abi: pokemonCardsAbi,
        functionName: 'isLocked',
        args: [tokenId],
      },
    ]),
    query: { enabled: uniqueCardIds.length > 0 },
  });

  // Extract tokenURIs for IPFS fetching
  const tokenURIs =
    cardDataQueries.data
      ?.filter((_, i) => i % 3 === 0)
      .map((r) => r.result as string)
      .filter((uri): uri is string => !!uri) ?? [];

  // Step 5: Fetch IPFS metadata
  const metadataQueries = useQueries({
    queries: tokenURIs.map((uri) => ({
      queryKey: ['ipfs-metadata', uri],
      queryFn: () => fetchIPFSMetadata(uri),
      enabled: !!uri,
      staleTime: Infinity, // IPFS metadata is immutable
      retry: 2,
    })),
  });

  // Step 6: Build card data map
  const cardDataMap = new Map<
    string,
    {
      metadata: CardMetadata | null;
      owner: `0x${string}`;
      isLocked: boolean;
    }
  >();

  uniqueCardIds.forEach((tokenId, i) => {
    const baseIndex = i * 3;
    const tokenURI = cardDataQueries.data?.[baseIndex]?.result as
      | string
      | undefined;
    const owner = cardDataQueries.data?.[baseIndex + 1]?.result as
      | `0x${string}`
      | undefined;
    const isLocked = cardDataQueries.data?.[baseIndex + 2]?.result as
      | boolean
      | undefined;

    // Find metadata by tokenURI
    const metadataIndex = tokenURIs.indexOf(tokenURI ?? '');
    const metadata =
      metadataIndex >= 0
        ? (metadataQueries[metadataIndex]?.data as CardMetadata | undefined)
        : null;

    cardDataMap.set(tokenId.toString(), {
      metadata: metadata ?? null,
      owner: owner ?? '0x0000000000000000000000000000000000000000',
      isLocked: isLocked ?? false,
    });
  });

  // Step 7: Enrich offers with card data and compute flags
  const enrichedOffers: TradeOffer[] = openOffers
    .map((item) => {
      if (!item.offer) return null;

      const makerCardData = cardDataMap.get(item.offer.makerTokenId.toString());
      const takerCardData = cardDataMap.get(item.offer.takerTokenId.toString());

      const isMyOffer =
        address?.toLowerCase() === item.offer.maker.toLowerCase();
      const iOwnTakerCard =
        address?.toLowerCase() === takerCardData?.owner?.toLowerCase();
      const canAccept = !isMyOffer && iOwnTakerCard && !takerCardData?.isLocked;

      return {
        offerId: item.offerId,
        maker: item.offer.maker,
        makerTokenId: item.offer.makerTokenId,
        takerTokenId: item.offer.takerTokenId,
        status: item.offer.status,
        createdAt: Number(item.offer.createdAt),
        makerCard: {
          metadata: makerCardData?.metadata ?? null,
          owner:
            makerCardData?.owner ??
            '0x0000000000000000000000000000000000000000',
          isLocked: makerCardData?.isLocked ?? false,
        },
        takerCard: {
          metadata: takerCardData?.metadata ?? null,
          owner:
            takerCardData?.owner ??
            '0x0000000000000000000000000000000000000000',
          isLocked: takerCardData?.isLocked ?? false,
        },
        isMyOffer,
        canAccept,
      };
    })
    .filter((offer): offer is TradeOffer => offer !== null);

  const isLoading =
    isLoadingIds ||
    offerQueries.isLoading ||
    cardDataQueries.isLoading ||
    metadataQueries.some((q) => q.isLoading);

  return {
    offers: enrichedOffers,
    myOffers: enrichedOffers.filter((o) => o.isMyOffer),
    acceptableOffers: enrichedOffers.filter((o) => o.canAccept),
    isLoading,
    isEmpty: !isLoading && enrichedOffers.length === 0,
  };
}
