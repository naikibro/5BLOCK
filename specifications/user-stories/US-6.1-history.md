# US-6.1: Consulter l'Historique des Transactions

> **Epic:** Historique & Traçabilité
> **Priorité:** Should Have
> **Complexité:** Moyenne

---

## Description

**En tant qu'** utilisateur,
**Je veux** voir l'historique des transactions et événements,
**Afin de** tracer l'activité du marketplace et la provenance des cartes.

---

## Critères d'acceptation

| ID | Critère | Vérifié |
|----|---------|---------|
| AC-6.1.1 | La page `/history` affiche les événements récents | [ ] |
| AC-6.1.2 | Les événements affichés incluent : CardMinted, TradeCreated, TradeAccepted, TradeCancelled | [ ] |
| AC-6.1.3 | Chaque événement affiche : type, timestamp, acteurs, cartes concernées | [ ] |
| AC-6.1.4 | Filtrage possible par type d'événement | [ ] |
| AC-6.1.5 | Filtrage possible par wallet (mes événements) | [ ] |
| AC-6.1.6 | Les timestamps sont affichés en format lisible | [ ] |
| AC-6.1.7 | Liens vers les transactions sur block explorer | [ ] |
| AC-6.1.8 | Pagination ou infinite scroll pour les longs historiques | [ ] |

---

## Events Smart Contract

### PokemonCards Events

```solidity
event CardMinted(
    address indexed owner,
    uint256 indexed tokenId,
    uint256 pokemonId,
    uint8 rarityTier
);

event CardTransferred(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to
);
```

### TradeMarket Events

```solidity
event TradeCreated(
    uint256 indexed offerId,
    address indexed maker,
    uint256 makerTokenId,
    uint256 takerTokenId
);

event TradeAccepted(
    uint256 indexed offerId,
    address indexed taker,
    address indexed maker
);

event TradeCancelled(
    uint256 indexed offerId
);
```

---

## Spécifications techniques

### Types d'événements

```typescript
// types/events.ts

type EventType = 'CardMinted' | 'CardTransferred' | 'TradeCreated' | 'TradeAccepted' | 'TradeCancelled';

interface BaseEvent {
  type: EventType;
  blockNumber: number;
  transactionHash: `0x${string}`;
  timestamp: number;
}

interface CardMintedEvent extends BaseEvent {
  type: 'CardMinted';
  owner: `0x${string}`;
  tokenId: bigint;
  pokemonId: number;
  rarityTier: number;
}

interface CardTransferredEvent extends BaseEvent {
  type: 'CardTransferred';
  tokenId: bigint;
  from: `0x${string}`;
  to: `0x${string}`;
}

interface TradeCreatedEvent extends BaseEvent {
  type: 'TradeCreated';
  offerId: bigint;
  maker: `0x${string}`;
  makerTokenId: bigint;
  takerTokenId: bigint;
}

interface TradeAcceptedEvent extends BaseEvent {
  type: 'TradeAccepted';
  offerId: bigint;
  taker: `0x${string}`;
  maker: `0x${string}`;
}

interface TradeCancelledEvent extends BaseEvent {
  type: 'TradeCancelled';
  offerId: bigint;
}

type HistoryEvent =
  | CardMintedEvent
  | CardTransferredEvent
  | TradeCreatedEvent
  | TradeAcceptedEvent
  | TradeCancelledEvent;
```

### Hook useHistory

```typescript
// hooks/useHistory.ts
import { usePublicClient, useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { pokemonCardsAbi, pokemonCardsAddress, tradeMarketAbi, tradeMarketAddress } from '@/lib/contracts';
import { parseAbiItem } from 'viem';

interface UseHistoryOptions {
  filter?: EventType[];
  myEventsOnly?: boolean;
  limit?: number;
}

export function useHistory(options: UseHistoryOptions = {}) {
  const { filter, myEventsOnly = false, limit = 50 } = options;
  const { address } = useAccount();
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['history', filter, myEventsOnly, address],
    queryFn: async () => {
      const events: HistoryEvent[] = [];

      // Fetch CardMinted events
      if (!filter || filter.includes('CardMinted')) {
        const mintedLogs = await publicClient!.getLogs({
          address: pokemonCardsAddress,
          event: parseAbiItem('event CardMinted(address indexed owner, uint256 indexed tokenId, uint256 pokemonId, uint8 rarityTier)'),
          fromBlock: 'earliest',
        });

        for (const log of mintedLogs) {
          if (myEventsOnly && log.args.owner?.toLowerCase() !== address?.toLowerCase()) continue;

          const block = await publicClient!.getBlock({ blockNumber: log.blockNumber });
          events.push({
            type: 'CardMinted',
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            timestamp: Number(block.timestamp),
            owner: log.args.owner!,
            tokenId: log.args.tokenId!,
            pokemonId: Number(log.args.pokemonId),
            rarityTier: Number(log.args.rarityTier),
          });
        }
      }

      // Fetch TradeCreated events
      if (!filter || filter.includes('TradeCreated')) {
        const createdLogs = await publicClient!.getLogs({
          address: tradeMarketAddress,
          event: parseAbiItem('event TradeCreated(uint256 indexed offerId, address indexed maker, uint256 makerTokenId, uint256 takerTokenId)'),
          fromBlock: 'earliest',
        });

        for (const log of createdLogs) {
          if (myEventsOnly && log.args.maker?.toLowerCase() !== address?.toLowerCase()) continue;

          const block = await publicClient!.getBlock({ blockNumber: log.blockNumber });
          events.push({
            type: 'TradeCreated',
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            timestamp: Number(block.timestamp),
            offerId: log.args.offerId!,
            maker: log.args.maker!,
            makerTokenId: log.args.makerTokenId!,
            takerTokenId: log.args.takerTokenId!,
          });
        }
      }

      // Fetch TradeAccepted events
      if (!filter || filter.includes('TradeAccepted')) {
        const acceptedLogs = await publicClient!.getLogs({
          address: tradeMarketAddress,
          event: parseAbiItem('event TradeAccepted(uint256 indexed offerId, address indexed taker, address indexed maker)'),
          fromBlock: 'earliest',
        });

        for (const log of acceptedLogs) {
          const isMyEvent = log.args.taker?.toLowerCase() === address?.toLowerCase() ||
                           log.args.maker?.toLowerCase() === address?.toLowerCase();
          if (myEventsOnly && !isMyEvent) continue;

          const block = await publicClient!.getBlock({ blockNumber: log.blockNumber });
          events.push({
            type: 'TradeAccepted',
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            timestamp: Number(block.timestamp),
            offerId: log.args.offerId!,
            taker: log.args.taker!,
            maker: log.args.maker!,
          });
        }
      }

      // Sort by timestamp descending
      events.sort((a, b) => b.timestamp - a.timestamp);

      return events.slice(0, limit);
    },
    staleTime: 30000, // 30 seconds
  });
}
```

### Composant EventCard

```typescript
// components/EventCard.tsx
'use client';

import { HistoryEvent } from '@/types/events';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const EVENT_STYLES: Record<string, { color: string; icon: string; label: string }> = {
  CardMinted: { color: 'bg-green-500', icon: '🎴', label: 'Minted' },
  CardTransferred: { color: 'bg-blue-500', icon: '📤', label: 'Transfer' },
  TradeCreated: { color: 'bg-purple-500', icon: '📝', label: 'Offer Created' },
  TradeAccepted: { color: 'bg-orange-500', icon: '🤝', label: 'Trade Completed' },
  TradeCancelled: { color: 'bg-gray-500', icon: '❌', label: 'Cancelled' },
};

interface EventCardProps {
  event: HistoryEvent;
  explorerUrl?: string;
}

export function EventCard({ event, explorerUrl = 'https://sepolia.etherscan.io' }: EventCardProps) {
  const style = EVENT_STYLES[event.type];

  const renderEventDetails = () => {
    switch (event.type) {
      case 'CardMinted':
        return (
          <p className="text-sm">
            <AddressLink address={event.owner} /> minted card #{event.tokenId.toString()}
            (Pokemon #{event.pokemonId})
          </p>
        );

      case 'TradeCreated':
        return (
          <p className="text-sm">
            <AddressLink address={event.maker} /> offered card #{event.makerTokenId.toString()}
            for card #{event.takerTokenId.toString()}
          </p>
        );

      case 'TradeAccepted':
        return (
          <p className="text-sm">
            <AddressLink address={event.taker} /> accepted trade with{' '}
            <AddressLink address={event.maker} />
          </p>
        );

      case 'TradeCancelled':
        return (
          <p className="text-sm">Offer #{event.offerId.toString()} was cancelled</p>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{style.icon}</span>
            <div>
              <Badge className={style.color}>{style.label}</Badge>
              <div className="mt-1">{renderEventDetails()}</div>
            </div>
          </div>

          <div className="text-right text-sm text-muted-foreground">
            <div>{format(event.timestamp * 1000, 'MMM d, HH:mm')}</div>
            <a
              href={`${explorerUrl}/tx/${event.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:underline"
            >
              View tx <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddressLink({ address }: { address: string }) {
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return <span className="font-mono text-xs">{short}</span>;
}
```

### Page History

```typescript
// app/history/page.tsx
'use client';

import { useState } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { EventCard } from '@/components/EventCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccount } from 'wagmi';

export default function HistoryPage() {
  const { isConnected } = useAccount();
  const [myEventsOnly, setMyEventsOnly] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filterMap: Record<string, EventType[] | undefined> = {
    all: undefined,
    mints: ['CardMinted'],
    trades: ['TradeCreated', 'TradeAccepted', 'TradeCancelled'],
  };

  const { data: events, isLoading } = useHistory({
    filter: filterMap[filter],
    myEventsOnly: myEventsOnly && isConnected,
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Activity History</h1>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="mints">Mints</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>
        </Tabs>

        {isConnected && (
          <div className="flex items-center gap-2">
            <Switch
              id="my-events"
              checked={myEventsOnly}
              onCheckedChange={setMyEventsOnly}
            />
            <Label htmlFor="my-events">My events only</Label>
          </div>
        )}
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {isLoading && (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        )}

        {!isLoading && events?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No events found.
          </div>
        )}

        {events?.map((event, i) => (
          <EventCard key={`${event.transactionHash}-${i}`} event={event} />
        ))}
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
│  Activity History                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  [All Events] [Mints] [Trades]              [✓] My events only      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🤝 [Trade Completed]                          Jan 15, 14:32   │  │
│  │    0x1234...abcd accepted trade with 0x5678...efgh  View tx → │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 📝 [Offer Created]                            Jan 15, 14:30   │  │
│  │    0x1234...abcd offered card #0 for card #1        View tx → │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🎴 [Minted]                                   Jan 15, 14:25   │  │
│  │    0x1234...abcd minted card #0 (Pokemon #25)       View tx → │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Scénarios de test

| # | Scénario | Étapes | Résultat attendu |
|---|----------|--------|------------------|
| 1 | Voir tous les events | 1. Aller sur /history | Liste chronologique |
| 2 | Filtrer par type | 1. Cliquer "Mints" | Seulement CardMinted |
| 3 | Mes events | 1. Activer "My events only" | Seulement mes actions |
| 4 | Lien transaction | 1. Cliquer "View tx" | Ouvre Etherscan |
| 5 | Événement récent | 1. Mint une carte 2. Voir history | Apparaît en haut |

---

## Définition of Done

- [ ] Hook `useHistory` avec query des events
- [ ] Types pour tous les événements
- [ ] Composant `EventCard` avec détails
- [ ] Page `/history` avec filtres
- [ ] Toggle "My events only"
- [ ] Liens vers block explorer
- [ ] Tri chronologique (récent en premier)
- [ ] Tests manuels passés
