# US-2.4: Voir les Détails d'une Carte

> **Epic:** Gestion des Cartes (Tokens)
> **Priorité:** Should Have
> **Complexité:** Faible

---

## Description

**En tant qu'** utilisateur,
**Je veux** voir les détails complets d'une carte,
**Afin de** connaître son historique et ses caractéristiques précises.

---

## Contexte & Justification

La page de détails offre une vue approfondie d'une carte spécifique. Elle est utile pour :
- Vérifier l'historique de propriété (provenance)
- Voir tous les attributs et timestamps
- Décider si on veut proposer cette carte en échange
- Accéder aux liens IPFS pour vérification

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-2.4.1 | La page `/card/{tokenId}` affiche les détails d'une carte | [ ] |
| AC-2.4.2 | L'image HD du Pokémon est affichée | [ ] |
| AC-2.4.3 | Toutes les stats sont affichées (HP, ATK, DEF, SPE, etc.) | [ ] |
| AC-2.4.4 | La rareté et la valeur sont affichées | [ ] |
| AC-2.4.5 | Les timestamps sont affichés en format lisible (created, lastTransfer) | [ ] |
| AC-2.4.6 | L'état de lock est affiché avec le temps restant | [ ] |
| AC-2.4.7 | La liste des propriétaires précédents est affichée | [ ] |
| AC-2.4.8 | Un lien vers la metadata IPFS est disponible | [ ] |
| AC-2.4.9 | Un bouton "Propose Trade" est visible si la carte appartient à l'utilisateur et n'est pas locked | [ ] |
| AC-2.4.10 | Si la carte n'existe pas, un message d'erreur s'affiche | [ ] |

---

## Données affichées

### Section principale

| Donnée | Source | Format |
|--------|--------|--------|
| Image HD | IPFS | Image plein format |
| Nom | IPFS metadata | "Pikachu #25" |
| Type(s) | IPFS metadata | Badges colorés |
| Token ID | On-chain | #0, #1, etc. |

### Section Stats

| Stat | Source | Affichage |
|------|--------|-----------|
| HP | IPFS attributes | Barre de progression + nombre |
| Attack | IPFS attributes | Barre de progression + nombre |
| Defense | IPFS attributes | Barre de progression + nombre |
| Speed | IPFS attributes | Barre de progression + nombre |
| Value | On-chain | Nombre bold |
| Rarity | On-chain | Badge coloré |

### Section Timestamps

| Timestamp | Source | Format |
|-----------|--------|--------|
| Created | On-chain (createdAt) | "Jan 15, 2025 at 14:32" |
| Last Transfer | On-chain (lastTransferAt) | "Jan 15, 2025 at 14:32" |
| Locked Until | On-chain (lockUntil) | "Available" ou countdown |

### Section Provenance

| Donnée | Source | Format |
|--------|--------|--------|
| Current Owner | On-chain (ownerOf) | Adresse tronquée |
| Previous Owners | On-chain (previousOwners) | Liste d'adresses |
| Metadata URI | On-chain (tokenURI) | Lien cliquable vers IPFS |

---

## Spécifications techniques

### Hook useCardDetails

```typescript
// hooks/useCardDetails.ts
import { useReadContract, useReadContracts } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { pokemonCardsAbi, pokemonCardsAddress } from '@/lib/contracts';
import { fetchIPFSMetadata } from '@/lib/ipfs';

interface CardDetails {
  tokenId: bigint;
  owner: `0x${string}`;
  // On-chain
  pokemonId: number;
  rarityTier: number;
  value: number;
  createdAt: Date;
  lastTransferAt: Date;
  lockUntil: Date;
  isLocked: boolean;
  lockRemaining: number;
  previousOwners: `0x${string}`[];
  tokenURI: string;
  // IPFS
  metadata: CardMetadata | null;
}

export function useCardDetails(tokenId: bigint) {
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
  const { data: metadata } = useQuery({
    queryKey: ['ipfs-metadata', tokenURI],
    queryFn: () => fetchIPFSMetadata(tokenURI as string),
    enabled: !!tokenURI,
    staleTime: Infinity,
  });

  const now = Math.floor(Date.now() / 1000);
  const lockUntil = Number(cardMeta?.lockUntil ?? 0);

  const details: CardDetails | null = exists ? {
    tokenId,
    owner: owner as `0x${string}`,
    pokemonId: Number(cardMeta?.pokemonId ?? 0),
    rarityTier: Number(cardMeta?.rarityTier ?? 1),
    value: Number(cardMeta?.value ?? 0),
    createdAt: new Date(Number(cardMeta?.createdAt ?? 0) * 1000),
    lastTransferAt: new Date(Number(cardMeta?.lastTransferAt ?? 0) * 1000),
    lockUntil: new Date(lockUntil * 1000),
    isLocked: lockUntil > now,
    lockRemaining: Math.max(0, lockUntil - now),
    previousOwners: (previousOwners as `0x${string}`[]) ?? [],
    tokenURI: tokenURI as string,
    metadata: metadata ?? null,
  } : null;

  return {
    details,
    exists: !!exists,
    isLoading: existsLoading,
    notFound: !existsLoading && !exists,
  };
}
```

### Page Card Details

```typescript
// app/card/[tokenId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useCardDetails } from '@/hooks/useCardDetails';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TypeBadge } from '@/components/TypeBadge';
import { RarityBadge } from '@/components/RarityBadge';
import { Lock, Unlock, ExternalLink, ArrowRightLeft, Copy } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function CardDetailsPage() {
  const params = useParams();
  const tokenId = BigInt(params.tokenId as string);
  const { address } = useAccount();
  const { details, isLoading, notFound } = useCardDetails(tokenId);

  if (isLoading) {
    return <CardDetailsSkeleton />;
  }

  if (notFound) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Card Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Token #{tokenId.toString()} does not exist.
        </p>
        <Link href="/catalog">
          <Button>Browse Catalog</Button>
        </Link>
      </div>
    );
  }

  if (!details) return null;

  const isOwner = address?.toLowerCase() === details.owner.toLowerCase();
  const canTrade = isOwner && !details.isLocked;
  const ipfsGatewayUrl = details.tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  const imageUrl = details.metadata?.image?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image */}
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={details.metadata?.name ?? 'Pokemon Card'}
                fill
                className="object-contain p-8"
              />
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {details.isLocked ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Locked ({formatTime(details.lockRemaining)})
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Unlock className="h-3 w-3" />
                Available
              </Badge>
            )}
          </div>
          <RarityBadge tier={details.rarityTier} className="absolute top-4 right-4" />
        </div>

        {/* Right: Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {details.metadata?.attributes
                ?.filter(a => a.trait_type === 'Type')
                .map(a => (
                  <TypeBadge key={String(a.value)} type={String(a.value).toLowerCase()} />
                ))}
            </div>
            <h1 className="text-3xl font-bold">
              {details.metadata?.name ?? `Card #${tokenId}`}
            </h1>
            <p className="text-muted-foreground">Token ID: #{tokenId.toString()}</p>
          </div>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['HP', 'Attack', 'Defense', 'Speed'].map(stat => {
                const attr = details.metadata?.attributes?.find(a => a.trait_type === stat);
                const value = Number(attr?.value ?? 0);
                const maxValue = 150; // Approx max for Gen 1
                return (
                  <div key={stat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{stat}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                    <Progress value={(value / maxValue) * 100} />
                  </div>
                );
              })}

              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Value</div>
                  <div className="text-2xl font-bold">{details.value}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Rarity</div>
                  <RarityBadge tier={details.rarityTier} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(details.createdAt, 'MMM d, yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Transfer</span>
                <span>{format(details.lastTransferAt, 'MMM d, yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lock Status</span>
                <span>
                  {details.isLocked
                    ? `Locked until ${format(details.lockUntil, 'HH:mm')}`
                    : 'Available for trade'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Provenance */}
          <Card>
            <CardHeader>
              <CardTitle>Provenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Owner</div>
                <AddressDisplay address={details.owner} isYou={isOwner} />
              </div>

              {details.previousOwners.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Previous Owners</div>
                  <div className="space-y-1">
                    {details.previousOwners.map((addr, i) => (
                      <AddressDisplay key={i} address={addr} />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t">
                <div className="text-sm text-muted-foreground mb-1">Metadata</div>
                <a
                  href={ipfsGatewayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                >
                  View on IPFS <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isOwner && (
            <Link href={`/trade/create?tokenId=${tokenId}`}>
              <Button className="w-full" size="lg" disabled={!canTrade}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                {canTrade ? 'Propose Trade' : 'Card is Locked'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
function AddressDisplay({ address, isYou }: { address: string; isYou?: boolean }) {
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span>{short}</span>
      {isYou && <Badge variant="secondary">You</Badge>}
      <button
        onClick={() => navigator.clipboard.writeText(address)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Copy className="h-3 w-3" />
      </button>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## Interface utilisateur

### Layout desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌────────────────────┐    ┌────────────────────────────────────┐  │
│  │  [🔓 Available]    │    │  ⚡ Electric                       │  │
│  │                    │    │                                     │  │
│  │                    │    │  Pikachu #25                        │  │
│  │      [Pikachu      │    │  Token ID: #0                       │  │
│  │       Image]       │    │                                     │  │
│  │                    │    │  ┌─ Stats ──────────────────────┐  │  │
│  │            [Rare]  │    │  │ HP      ████████░░  35       │  │  │
│  │                    │    │  │ Attack  ██████████░  55      │  │  │
│  └────────────────────┘    │  │ Defense ████████░░  40       │  │  │
│                            │  │ Speed   ██████████████  90   │  │  │
│                            │  │                              │  │  │
│                            │  │ Value: 130    Rarity: [Rare] │  │  │
│                            │  └──────────────────────────────┘  │  │
│                            │                                     │  │
│                            │  ┌─ Timeline ───────────────────┐  │  │
│                            │  │ Created:      Jan 15, 14:32  │  │  │
│                            │  │ Last Transfer: Jan 15, 14:32 │  │  │
│                            │  │ Lock Status:  Available      │  │  │
│                            │  └──────────────────────────────┘  │  │
│                            │                                     │  │
│                            │  ┌─ Provenance ─────────────────┐  │  │
│                            │  │ Current Owner: 0x1234...(You)│  │  │
│                            │  │ Previous: (none)             │  │  │
│                            │  │ Metadata: View on IPFS →     │  │  │
│                            │  └──────────────────────────────┘  │  │
│                            │                                     │  │
│                            │  [      Propose Trade      ]        │  │
│                            └────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Scénarios de test

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Carte existante | 1. Aller sur /card/0 | Détails affichés |
| 2 | Carte inexistante | 1. Aller sur /card/999 | "Card Not Found" |
| 3 | Ma carte | 1. Voir ma carte | Badge "You" sur owner |
| 4 | Carte locked | 1. Voir carte juste mintée | Countdown affiché |
| 5 | Bouton trade | 1. Ma carte unlocked | Bouton "Propose Trade" actif |
| 6 | Lien IPFS | 1. Cliquer "View on IPFS" | Ouvre metadata JSON |
| 7 | Copie adresse | 1. Cliquer icône copie | Adresse dans clipboard |

---

## Dépendances

### Dépendances fonctionnelles
- US-2.2 (Mint) - cartes doivent exister
- US-2.3 (Inventory) - navigation depuis l'inventaire

### Bloque
- US-3.1 (Create Trade) - bouton "Propose Trade"

---

## Définition of Done

- [ ] Hook `useCardDetails` avec toutes les données
- [ ] Page `/card/[tokenId]` responsive
- [ ] Affichage de toutes les stats avec Progress bars
- [ ] Section Timeline avec dates formatées
- [ ] Section Provenance avec previousOwners
- [ ] Lien IPFS fonctionnel
- [ ] État "Not Found" géré
- [ ] Bouton Trade conditionnel
- [ ] Tests manuels passés
