# US-3.2: Consulter les Offres d'Échange

> **Epic:** Marketplace d'Échange
> **Priorité:** Must Have
> **Complexité:** Moyenne

---

## Description

**En tant qu'** utilisateur,
**Je veux** voir toutes les offres d'échange ouvertes,
**Afin de** trouver un échange intéressant.

---

## Contexte & Justification

La liste des offres est le cœur du marketplace. Elle permet aux utilisateurs de :
- Découvrir quelles cartes sont proposées à l'échange
- Identifier les offres qu'ils peuvent accepter (s'ils possèdent la carte demandée)
- Comparer les différentes opportunités d'échange

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-3.2.1 | La page `/trade` affiche la liste des offres avec statut "Open" | [ ] |
| AC-3.2.2 | Chaque offre affiche : carte proposée, carte demandée, adresse du maker | [ ] |
| AC-3.2.3 | Les images et noms des cartes sont chargés depuis IPFS | [ ] |
| AC-3.2.4 | Un indicateur montre si l'utilisateur possède la carte demandée | [ ] |
| AC-3.2.5 | Un bouton "Accept" est visible si l'utilisateur peut accepter | [ ] |
| AC-3.2.6 | Filtrage possible par : type de carte, rareté | [ ] |
| AC-3.2.7 | Les offres de l'utilisateur connecté sont marquées ("Your offer") | [ ] |
| AC-3.2.8 | Un skeleton loader s'affiche pendant le chargement | [ ] |
| AC-3.2.9 | Message si aucune offre ouverte | [ ] |

---

## Données affichées par offre

| Donnée | Source | Description |
|--------|--------|-------------|
| Offer ID | On-chain | Identifiant unique |
| Maker | On-chain | Adresse du créateur |
| Maker Card | IPFS | Image + nom de la carte proposée |
| Taker Card | IPFS | Image + nom de la carte demandée |
| Created | On-chain | Timestamp de création |
| Can Accept | Computed | L'utilisateur peut-il accepter ? |

---

## Spécifications techniques

### Hook useOpenOffers

```typescript
// hooks/useOpenOffers.ts
import { useReadContract, useReadContracts } from 'wagmi';
import { useQueries } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { tradeMarketAbi, tradeMarketAddress, pokemonCardsAbi, pokemonCardsAddress } from '@/lib/contracts';
import { fetchIPFSMetadata } from '@/lib/ipfs';

interface TradeOffer {
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

export function useOpenOffers() {
  const { address } = useAccount();

  // Get total offer count
  const { data: offerCount } = useReadContract({
    address: tradeMarketAddress,
    abi: tradeMarketAbi,
    functionName: 'getOfferCount',
  });

  // Get all offers
  const offerQueries = useReadContracts({
    contracts: Array.from({ length: Number(offerCount ?? 0) }, (_, i) => ({
      address: tradeMarketAddress,
      abi: tradeMarketAbi,
      functionName: 'getOffer',
      args: [BigInt(i)],
    })),
    query: { enabled: !!offerCount && offerCount > 0n },
  });

  // Filter to open offers only
  const openOffers = (offerQueries.data ?? [])
    .map((result, index) => ({ ...result.result, offerId: BigInt(index) }))
    .filter(offer => offer?.status === 0); // 0 = Open

  // Get card details for each offer
  const cardIds = openOffers.flatMap(o => [o.makerTokenId, o.takerTokenId]);
  const uniqueCardIds = [...new Set(cardIds.map(id => id.toString()))].map(BigInt);

  // Fetch card metadata, owners, and lock status
  const cardDataQueries = useReadContracts({
    contracts: uniqueCardIds.flatMap(tokenId => [
      { address: pokemonCardsAddress, abi: pokemonCardsAbi, functionName: 'tokenURI', args: [tokenId] },
      { address: pokemonCardsAddress, abi: pokemonCardsAbi, functionName: 'ownerOf', args: [tokenId] },
      { address: pokemonCardsAddress, abi: pokemonCardsAbi, functionName: 'isLocked', args: [tokenId] },
    ]),
    query: { enabled: uniqueCardIds.length > 0 },
  });

  // Fetch IPFS metadata
  const tokenURIs = cardDataQueries.data?.filter((_, i) => i % 3 === 0).map(r => r.result as string) ?? [];
  const metadataQueries = useQueries({
    queries: tokenURIs.map(uri => ({
      queryKey: ['ipfs-metadata', uri],
      queryFn: () => fetchIPFSMetadata(uri),
      enabled: !!uri,
      staleTime: Infinity,
    })),
  });

  // Build card data map
  const cardDataMap = new Map<string, { metadata: CardMetadata | null; owner: string; isLocked: boolean }>();
  uniqueCardIds.forEach((tokenId, i) => {
    const baseIndex = i * 3;
    cardDataMap.set(tokenId.toString(), {
      metadata: metadataQueries[i]?.data ?? null,
      owner: cardDataQueries.data?.[baseIndex + 1]?.result as string ?? '',
      isLocked: cardDataQueries.data?.[baseIndex + 2]?.result as boolean ?? false,
    });
  });

  // Enrich offers with card data
  const enrichedOffers: TradeOffer[] = openOffers.map(offer => {
    const makerCardData = cardDataMap.get(offer.makerTokenId.toString());
    const takerCardData = cardDataMap.get(offer.takerTokenId.toString());

    const isMyOffer = address?.toLowerCase() === offer.maker.toLowerCase();
    const iOwnTakerCard = address?.toLowerCase() === takerCardData?.owner?.toLowerCase();
    const canAccept = !isMyOffer && iOwnTakerCard && !takerCardData?.isLocked;

    return {
      offerId: offer.offerId,
      maker: offer.maker,
      makerTokenId: offer.makerTokenId,
      takerTokenId: offer.takerTokenId,
      status: offer.status,
      createdAt: Number(offer.createdAt),
      makerCard: {
        metadata: makerCardData?.metadata ?? null,
        owner: makerCardData?.owner as `0x${string}`,
        isLocked: makerCardData?.isLocked ?? false,
      },
      takerCard: {
        metadata: takerCardData?.metadata ?? null,
        owner: takerCardData?.owner as `0x${string}`,
        isLocked: takerCardData?.isLocked ?? false,
      },
      isMyOffer,
      canAccept,
    };
  });

  return {
    offers: enrichedOffers,
    myOffers: enrichedOffers.filter(o => o.isMyOffer),
    acceptableOffers: enrichedOffers.filter(o => o.canAccept),
    isLoading: offerQueries.isLoading,
    isEmpty: !offerQueries.isLoading && enrichedOffers.length === 0,
  };
}
```

### Composant OfferCard

```typescript
// components/OfferCard.tsx
'use client';

import Image from 'next/image';
import { TradeOffer } from '@/hooks/useOpenOffers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OfferCardProps {
  offer: TradeOffer;
  onAccept?: () => void;
  onCancel?: () => void;
}

export function OfferCard({ offer, onAccept, onCancel }: OfferCardProps) {
  const makerImageUrl = offer.makerCard.metadata?.image?.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  );
  const takerImageUrl = offer.takerCard.metadata?.image?.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header with badges */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            Offer #{offer.offerId.toString()}
          </span>
          <div className="flex gap-2">
            {offer.isMyOffer && (
              <Badge variant="secondary">Your Offer</Badge>
            )}
            {offer.canAccept && (
              <Badge variant="default" className="bg-green-500">
                Can Accept
              </Badge>
            )}
          </div>
        </div>

        {/* Cards swap visualization */}
        <div className="flex items-center justify-between gap-4">
          {/* Maker's card (offered) */}
          <div className="flex-1 text-center">
            <div className="relative aspect-square w-24 mx-auto bg-gray-100 rounded-lg overflow-hidden">
              {makerImageUrl && (
                <Image
                  src={makerImageUrl}
                  alt={offer.makerCard.metadata?.name ?? 'Card'}
                  fill
                  className="object-contain p-2"
                />
              )}
            </div>
            <p className="mt-2 text-sm font-medium truncate">
              {offer.makerCard.metadata?.name ?? `#${offer.makerTokenId}`}
            </p>
            <p className="text-xs text-muted-foreground">Offered</p>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Taker's card (requested) */}
          <div className="flex-1 text-center">
            <div className="relative aspect-square w-24 mx-auto bg-gray-100 rounded-lg overflow-hidden">
              {takerImageUrl && (
                <Image
                  src={takerImageUrl}
                  alt={offer.takerCard.metadata?.name ?? 'Card'}
                  fill
                  className="object-contain p-2"
                />
              )}
            </div>
            <p className="mt-2 text-sm font-medium truncate">
              {offer.takerCard.metadata?.name ?? `#${offer.takerTokenId}`}
            </p>
            <p className="text-xs text-muted-foreground">Requested</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              By {formatAddress(offer.maker)}
              <br />
              {formatDistanceToNow(offer.createdAt * 1000, { addSuffix: true })}
            </div>

            <div className="flex gap-2">
              {offer.isMyOffer && onCancel && (
                <Button variant="destructive" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
              {offer.canAccept && onAccept && (
                <Button size="sm" onClick={onAccept}>
                  <Check className="h-4 w-4 mr-1" /> Accept
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
```

### Page Trade (liste des offres)

```typescript
// app/trade/page.tsx
'use client';

import { useState } from 'react';
import { useOpenOffers } from '@/hooks/useOpenOffers';
import { CreateOfferForm } from '@/components/CreateOfferForm';
import { OfferCard } from '@/components/OfferCard';
import { OfferCardSkeleton } from '@/components/OfferCardSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';

export default function TradePage() {
  const router = useRouter();
  const { offers, myOffers, acceptableOffers, isLoading, isEmpty } = useOpenOffers();
  const [activeTab, setActiveTab] = useState('all');

  const handleAccept = (offerId: bigint) => {
    router.push(`/trade/accept/${offerId}`);
  };

  const handleCancel = (offerId: bigint) => {
    router.push(`/trade/cancel/${offerId}`);
  };

  const displayedOffers = {
    all: offers,
    mine: myOffers,
    acceptable: acceptableOffers,
  }[activeTab] ?? offers;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Trade Marketplace</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Create offer form */}
        <div className="lg:col-span-1">
          <CreateOfferForm />
        </div>

        {/* Right: Offers list */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All Offers ({offers.length})
              </TabsTrigger>
              <TabsTrigger value="acceptable">
                Can Accept ({acceptableOffers.length})
              </TabsTrigger>
              <TabsTrigger value="mine">
                My Offers ({myOffers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {/* Loading */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <OfferCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && displayedOffers.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {activeTab === 'all' && 'No open offers yet. Create the first one!'}
                    {activeTab === 'acceptable' && 'No offers you can accept right now.'}
                    {activeTab === 'mine' && "You haven't created any offers yet."}
                  </p>
                </div>
              )}

              {/* Offers grid */}
              {!isLoading && displayedOffers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedOffers.map(offer => (
                    <OfferCard
                      key={offer.offerId.toString()}
                      offer={offer}
                      onAccept={() => handleAccept(offer.offerId)}
                      onCancel={() => handleCancel(offer.offerId)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
```

---

## Interface utilisateur

### Layout de la page

```
┌─────────────────────────────────────────────────────────────────────┐
│  Trade Marketplace                                                   │
├─────────────────────┬───────────────────────────────────────────────┤
│                     │                                                │
│  Create Trade       │  [All Offers (5)] [Can Accept (2)] [My (1)]   │
│  Offer              │  ────────────────────────────────────────────  │
│  ─────────────────  │                                                │
│                     │  ┌─────────────────┐  ┌─────────────────┐     │
│  Your Card:         │  │ Offer #0        │  │ Offer #1        │     │
│  [Pikachu ▼]        │  │ [Your Offer]    │  │ [Can Accept]    │     │
│                     │  │                 │  │                 │     │
│  Requested:         │  │ 🖼️ → 🖼️        │  │ 🖼️ → 🖼️        │     │
│  [Token ID: 5]      │  │ Pika → Bulba    │  │ Charm → Pika    │     │
│                     │  │                 │  │                 │     │
│  [Create Offer]     │  │ [Cancel]        │  │ [Accept]        │     │
│                     │  └─────────────────┘  └─────────────────┘     │
│                     │                                                │
└─────────────────────┴───────────────────────────────────────────────┘
```

---

## Scénarios de test

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Liste vide | 1. Aucune offre créée | Message "No open offers" |
| 2 | Voir toutes | 1. Plusieurs offres créées | Toutes affichées |
| 3 | Tab "Can Accept" | 1. Je possède une carte demandée | Offre dans cet onglet |
| 4 | Tab "My Offers" | 1. J'ai créé une offre | Offre dans cet onglet |
| 5 | Badge "Your Offer" | 1. Voir mes offres | Badge visible |
| 6 | Badge "Can Accept" | 1. Possède carte demandée | Badge vert visible |

---

## Dépendances

### Dépendances fonctionnelles
- US-3.1 (Create Offer) - des offres doivent exister

### Bloque
- US-3.3 (Accept Offer) - bouton Accept
- US-3.4 (Cancel Offer) - bouton Cancel

---

## Définition of Done

- [ ] Hook `useOpenOffers` avec enrichissement des données
- [ ] Composant `OfferCard` avec visualisation swap
- [ ] Page `/trade` avec tabs et filtres
- [ ] Indicateurs "Your Offer" et "Can Accept"
- [ ] Skeleton loaders
- [ ] État vide géré
- [ ] Tests manuels passés
